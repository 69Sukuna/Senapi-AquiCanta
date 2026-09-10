import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { PrismaService } from '../prisma/prisma.service';
import { EscanearPuntoDto } from './dto/escanear-punto.dto';

const CATALOGO_TRAYECTO_INCLUDE = {
  eventos: {
    orderBy: { orden: 'asc' as const },
    include: {
      puntos: {
        select: { id: true, nombre: true, instancia: true, imagenUrl: true },
      },
    },
  },
  rangos: {
    orderBy: { orden: 'asc' as const },
    include: { eventos: { select: { id: true } } },
  },
};

type TrayectoConDetalle = Prisma.TrayectoGetPayload<{ include: typeof CATALOGO_TRAYECTO_INCLUDE }>;

@Injectable()
export class SellosService {
  constructor(private readonly prisma: PrismaService) {}

  listarTrayectos() {
    return this.prisma.trayecto.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'asc' },
      include: CATALOGO_TRAYECTO_INCLUDE,
    });
  }

  private async trayectoConDetalleOrThrow(trayectoId: string) {
    const trayecto = await this.prisma.trayecto.findUnique({
      where: { id: trayectoId },
      include: CATALOGO_TRAYECTO_INCLUDE,
    });

    if (!trayecto) {
      throw new NotFoundException(`Trayecto ${trayectoId} no encontrado`);
    }

    return trayecto;
  }

  // Agrupa los puntos de un evento por su etiqueta `instancia` (null = ocurrencia
  // única) y determina si, para ese visitante, hay al menos un grupo completo.
  private construirProgreso(trayecto: TrayectoConDetalle, puntosEscaneados: Set<string>) {
    const eventoCompletado = new Map<string, boolean>();

    const eventos = trayecto.eventos.map((evento) => {
      const grupos = new Map<string, typeof evento.puntos>();
      for (const punto of evento.puntos) {
        const clave = punto.instancia ?? '__unico__';
        const grupo = grupos.get(clave) ?? [];
        grupo.push(punto);
        grupos.set(clave, grupo);
      }

      const gruposConEstado = Array.from(grupos.entries()).map(([instancia, puntos]) => ({
        instancia: instancia === '__unico__' ? null : instancia,
        completo: puntos.every((p) => puntosEscaneados.has(p.id)),
        puntos: puntos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          imagenUrl: p.imagenUrl,
          escaneado: puntosEscaneados.has(p.id),
        })),
      }));

      const completado = gruposConEstado.some((g) => g.completo);
      eventoCompletado.set(evento.id, completado);

      return {
        id: evento.id,
        nombre: evento.nombre,
        orden: evento.orden,
        imagenUrl: evento.imagenUrl,
        completado,
        grupos: gruposConEstado,
      };
    });

    const rangos = trayecto.rangos.map((rango) => ({
      id: rango.id,
      nombre: rango.nombre,
      orden: rango.orden,
      alcanzado: rango.eventos.length > 0 && rango.eventos.every((e) => eventoCompletado.get(e.id) === true),
    }));

    const trayectoCompleto = eventos.length > 0 && eventos.every((e) => e.completado);

    return {
      id: trayecto.id,
      nombre: trayecto.nombre,
      descripcion: trayecto.descripcion,
      imagenUrl: trayecto.imagenUrl,
      completo: trayectoCompleto,
      eventos,
      rangos,
    };
  }

  async progreso(trayectoId: string, visitorId: string) {
    const trayecto = await this.trayectoConDetalleOrThrow(trayectoId);

    const escaneos = await this.prisma.escaneoPunto.findMany({
      where: { visitorId, punto: { evento: { trayectoId } } },
      select: { puntoId: true },
    });

    return this.construirProgreso(trayecto, new Set(escaneos.map((e) => e.puntoId)));
  }

  async escanear(dto: EscanearPuntoDto) {
    const punto = await this.prisma.puntoEscaneo.findUnique({
      where: { codigo: dto.codigo },
      include: { evento: true },
    });

    if (!punto) {
      throw new NotFoundException(`No existe ningún punto de escaneo con ese código`);
    }

    const existente = await this.prisma.escaneoPunto.findUnique({
      where: { visitorId_puntoId: { visitorId: dto.visitorId, puntoId: punto.id } },
    });

    if (!existente) {
      await this.prisma.escaneoPunto.create({
        data: { visitorId: dto.visitorId, puntoId: punto.id },
      });
    }

    const progreso = await this.progreso(punto.evento.trayectoId, dto.visitorId);
    const evento = progreso.eventos.find((e) => e.id === punto.evento.id)!;

    return {
      punto: { id: punto.id, nombre: punto.nombre, imagenUrl: punto.imagenUrl },
      yaExistia: Boolean(existente),
      evento: { id: evento.id, nombre: evento.nombre, imagenUrl: evento.imagenUrl, completado: evento.completado },
      trayecto: { id: progreso.id, nombre: progreso.nombre, imagenUrl: progreso.imagenUrl, completo: progreso.completo },
      rangos: progreso.rangos,
    };
  }
}

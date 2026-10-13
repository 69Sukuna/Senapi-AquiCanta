import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AlcanceInscripciones } from '../inscripciones/alcance-inscripciones';
import { CrearListaNiustaDto } from './dto/crear-lista-niusta.dto';

const CATEGORIA_NUSTA = 'Ñusta';

@Injectable()
export class ListaNiustaService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearListaNiustaDto) {
    const cantante = await this.prisma.cantante.findUnique({
      where: { id: dto.cantanteId },
      include: { categoria: true, _count: { select: { listaNiusta: true } } },
    });
    if (!cantante) {
      throw new NotFoundException(`Cantante ${dto.cantanteId} no encontrado`);
    }
    if (cantante.categoria.nombre !== CATEGORIA_NUSTA) {
      throw new BadRequestException('La lista de canciones adicionales solo aplica a la categoría "Ñusta"');
    }
    // Se carga una sola vez, justo después de inscribirse: como el endpoint es
    // público (igual que la subida de fotos), no se permite reescribir una
    // lista ya guardada — cualquier corrección la hace el equipo del festival.
    if (cantante._count.listaNiusta > 0) {
      throw new ConflictException('Esta postulación ya tiene su lista de canciones registrada');
    }

    const duracionMaxima = cantante.categoria.duracionMaximaMinutos;
    dto.canciones.forEach((cancion, i) => {
      const minutos = Number(cancion.tiempo);
      if (!Number.isFinite(minutos) || minutos <= 0) {
        throw new BadRequestException(`Canción ${i + 2}: la duración debe ser un número de minutos`);
      }
      if (minutos > duracionMaxima) {
        throw new BadRequestException(`Canción ${i + 2}: la duración no puede superar los ${duracionMaxima} minutos`);
      }
    });

    await this.prisma.listaNiusta.createMany({
      data: dto.canciones.map((cancion, i) => ({
        cantanteId: cantante.id,
        orden: i + 2,
        tituloTema: cancion.tituloTema.trim(),
        autorCompositor: cancion.autorCompositor.trim(),
        ritmo: cancion.ritmo.trim(),
        tiempo: cancion.tiempo.trim(),
      })),
    });
    return this.listarPorCantante(cantante.id, {});
  }

  // Todas las canciones adicionales visibles para quien llama (un USER solo
  // las de su departamento) — para exportar la lista de inscritos sin hacer
  // una petición por cada Ñusta.
  async listarTodas(alcance: AlcanceInscripciones) {
    if (alcance === null) return [];
    return this.prisma.listaNiusta.findMany({
      where: { cantante: alcance },
      orderBy: [{ cantanteId: 'asc' }, { orden: 'asc' }],
      select: {
        id: true,
        cantanteId: true,
        orden: true,
        tituloTema: true,
        autorCompositor: true,
        ritmo: true,
        tiempo: true,
      },
    });
  }

  async listarPorCantante(cantanteId: string, alcance: AlcanceInscripciones) {
    if (alcance === null) {
      throw new NotFoundException(`Cantante ${cantanteId} no encontrado`);
    }
    const cantante = await this.prisma.cantante.findFirst({
      where: { id: cantanteId, ...alcance },
      select: { id: true },
    });
    if (!cantante) {
      throw new NotFoundException(`Cantante ${cantanteId} no encontrado`);
    }

    return this.prisma.listaNiusta.findMany({
      where: { cantanteId },
      orderBy: { orden: 'asc' },
      select: { id: true, orden: true, tituloTema: true, autorCompositor: true, ritmo: true, tiempo: true },
    });
  }
}

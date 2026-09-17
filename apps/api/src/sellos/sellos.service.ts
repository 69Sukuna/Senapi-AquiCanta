import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Medalla, Prisma } from '@repo/database';
import { PrismaService } from '../prisma/prisma.service';
import { EscanearPuntoDto } from './dto/escanear-punto.dto';
import { CrearTrayectoDto } from './dto/admin/crear-trayecto.dto';
import { ActualizarTrayectoDto } from './dto/admin/actualizar-trayecto.dto';
import { CrearEventoDto } from './dto/admin/crear-evento.dto';
import { ActualizarEventoDto } from './dto/admin/actualizar-evento.dto';
import { CrearPuntoDto } from './dto/admin/crear-punto.dto';
import { ActualizarPuntoDto } from './dto/admin/actualizar-punto.dto';
import { CrearRangoDto } from './dto/admin/crear-rango.dto';
import { ActualizarRangoDto } from './dto/admin/actualizar-rango.dto';
import { CrearMedallaDto } from './dto/admin/crear-medalla.dto';
import { ActualizarMedallaDto } from './dto/admin/actualizar-medalla.dto';

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

// Igual al catálogo público, pero con los datos completos que solo el panel
// de administración necesita: el `codigo` de cada punto (el público lo omite
// a propósito, es el secreto del QR físico) y el `nombre` de los eventos que
// exige cada Rango (el público solo necesita el `id` para calcular alcanzado).
const CATALOGO_TRAYECTO_ADMIN_INCLUDE = {
  eventos: {
    orderBy: { orden: 'asc' as const },
    include: { puntos: true },
  },
  rangos: {
    orderBy: { orden: 'asc' as const },
    include: { eventos: { select: { id: true, nombre: true } } },
  },
};

type TrayectoConDetalle = Prisma.TrayectoGetPayload<{ include: typeof CATALOGO_TRAYECTO_INCLUDE }>;

@Injectable()
export class SellosService {
  constructor(private readonly prisma: PrismaService) {}

  listarTrayectos() {
    return this.prisma.trayecto.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' },
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

    const progreso = this.construirProgreso(trayecto, new Set(escaneos.map((e) => e.puntoId)));

    // Solo se calcula (y se expone) si el admin activó `mostrarConteoVisitantes`
    // para este trayecto — si no, el cliente no debe ver este dato.
    return {
      ...progreso,
      visitantesUnicos: trayecto.mostrarConteoVisitantes ? await this.contarVisitantesUnicos(trayectoId) : null,
    };
  }

  // Medallas: reconocimiento GLOBAL por cantidad TOTAL de sellos escaneados
  // por el visitante — a propósito, no filtra por trayecto (a diferencia de
  // `progreso`, que sí es por trayecto porque Eventos/Rangos sí lo son).
  async medallasGlobales(visitorId: string) {
    const [medallas, totalEscaneados] = await Promise.all([
      this.prisma.medalla.findMany({ orderBy: { orden: 'asc' } }),
      this.prisma.escaneoPunto.count({ where: { visitorId } }),
    ]);

    return medallas.map((medalla) => ({
      id: medalla.id,
      nombre: medalla.nombre,
      descripcion: medalla.descripcion,
      umbral: medalla.umbral,
      alcanzada: totalEscaneados >= medalla.umbral,
    }));
  }

  // Fusiona el progreso anónimo (localStorage) de un visitante recién
  // logueado con su cuenta real. Si algún punto ya estaba escaneado bajo
  // AMBOS ids (ej. lo escaneó anónimo en un celular y ya de nuevo logueado
  // en otro), se descarta el duplicado del anónimo en vez de chocar con el
  // unique [visitorId, puntoId].
  async vincularVisitante(userId: string, visitorIdAnonimo: string) {
    if (userId === visitorIdAnonimo) return;

    await this.prisma.$transaction(async (tx) => {
      const escaneosAnonimos = await tx.escaneoPunto.findMany({
        where: { visitorId: visitorIdAnonimo },
        select: { id: true, puntoId: true },
      });
      if (escaneosAnonimos.length === 0) return;

      const escaneosDelUsuario = await tx.escaneoPunto.findMany({
        where: { visitorId: userId },
        select: { puntoId: true },
      });
      const puntosYaEscaneados = new Set(escaneosDelUsuario.map((e) => e.puntoId));

      const idsAReasignar = escaneosAnonimos.filter((e) => !puntosYaEscaneados.has(e.puntoId)).map((e) => e.id);
      const idsADescartar = escaneosAnonimos.filter((e) => puntosYaEscaneados.has(e.puntoId)).map((e) => e.id);

      if (idsAReasignar.length > 0) {
        await tx.escaneoPunto.updateMany({ where: { id: { in: idsAReasignar } }, data: { visitorId: userId } });
      }
      if (idsADescartar.length > 0) {
        await tx.escaneoPunto.deleteMany({ where: { id: { in: idsADescartar } } });
      }
    });
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

  // ── Administración ──────────────────────────────────────────────────────
  // Todo lo de acá abajo es exclusivo del panel de administración (guardado
  // por JwtAuthGuard + RolesGuard en SellosAdminController) — no lo usa la
  // vista pública. Devuelve siempre el registro con el include "admin"
  // (que incluye el `codigo` de los puntos y el `nombre` de los eventos de
  // cada Rango) para que el frontend pueda reemplazar el ítem en su estado
  // local sin volver a pedir todo el árbol.

  async listarTrayectosAdmin() {
    const trayectos = await this.prisma.trayecto.findMany({
      orderBy: { createdAt: 'asc' },
      include: CATALOGO_TRAYECTO_ADMIN_INCLUDE,
    });

    return Promise.all(
      trayectos.map(async (trayecto) => ({
        ...trayecto,
        visitantesUnicos: await this.contarVisitantesUnicos(trayecto.id),
      })),
    );
  }

  // Cantidad de visitantes DISTINTOS que escanearon al menos un punto de
  // cualquier evento de este trayecto (no la cantidad de escaneos en total).
  private async contarVisitantesUnicos(trayectoId: string): Promise<number> {
    const escaneos = await this.prisma.escaneoPunto.findMany({
      where: { punto: { evento: { trayectoId } } },
      distinct: ['visitorId'],
      select: { visitorId: true },
    });

    return escaneos.length;
  }

  private async trayectoAdminOrThrow(id: string) {
    const trayecto = await this.prisma.trayecto
      .findUniqueOrThrow({ where: { id }, include: CATALOGO_TRAYECTO_ADMIN_INCLUDE })
      .catch(() => {
        throw new NotFoundException(`Trayecto ${id} no encontrado`);
      });

    return { ...trayecto, visitantesUnicos: await this.contarVisitantesUnicos(id) };
  }

  crearTrayecto(dto: CrearTrayectoDto) {
    return this.prisma.trayecto
      .create({ data: dto })
      .then((t) => this.trayectoAdminOrThrow(t.id));
  }

  async actualizarTrayecto(id: string, dto: ActualizarTrayectoDto) {
    await this.trayectoAdminOrThrow(id);
    await this.prisma.trayecto.update({ where: { id }, data: dto });
    return this.trayectoAdminOrThrow(id);
  }

  async eliminarTrayecto(id: string) {
    await this.trayectoAdminOrThrow(id);
    await this.prisma.trayecto.delete({ where: { id } });
  }

  async crearEvento(trayectoId: string, dto: CrearEventoDto) {
    await this.trayectoAdminOrThrow(trayectoId);
    // El orden ya no lo escribe el admin a mano — un evento nuevo siempre se
    // agrega al final; para reordenar existe `reordenarEventos`.
    const orden = (await this.prisma.evento.count({ where: { trayectoId } })) + 1;
    const evento = await this.prisma.evento.create({ data: { ...dto, orden, trayectoId } });
    return this.trayectoAdminOrThrow(evento.trayectoId);
  }

  // Recibe los ids en el orden final deseado (como quedaron tras arrastrar o
  // apretar subir/bajar en el panel) y renumera 1..N en una transacción — así
  // el orden queda siempre secuencial sin huecos, sin importar el estado
  // previo en la base.
  async reordenarEventos(trayectoId: string, ids: string[]) {
    await this.trayectoAdminOrThrow(trayectoId);
    await this.prisma.$transaction(
      ids.map((id, i) => this.prisma.evento.update({ where: { id }, data: { orden: i + 1 } })),
    );
    return this.trayectoAdminOrThrow(trayectoId);
  }

  private async eventoOrThrow(id: string) {
    const evento = await this.prisma.evento.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException(`Evento ${id} no encontrado`);
    return evento;
  }

  async actualizarEvento(id: string, dto: ActualizarEventoDto) {
    const evento = await this.eventoOrThrow(id);
    await this.prisma.evento.update({ where: { id }, data: dto });
    return this.trayectoAdminOrThrow(evento.trayectoId);
  }

  async eliminarEvento(id: string) {
    const evento = await this.eventoOrThrow(id);
    await this.prisma.evento.delete({ where: { id } });
    return this.trayectoAdminOrThrow(evento.trayectoId);
  }

  private async puntoTrayectoId(eventoId: string) {
    const evento = await this.eventoOrThrow(eventoId);
    return evento.trayectoId;
  }

  async crearPunto(eventoId: string, dto: CrearPuntoDto) {
    const trayectoId = await this.puntoTrayectoId(eventoId);
    try {
      await this.prisma.puntoEscaneo.create({ data: { ...dto, eventoId } });
    } catch (error) {
      throw this.aConflictoSiCodigoDuplicado(error);
    }
    return this.trayectoAdminOrThrow(trayectoId);
  }

  private async puntoOrThrow(id: string) {
    const punto = await this.prisma.puntoEscaneo.findUnique({ where: { id }, include: { evento: true } });
    if (!punto) throw new NotFoundException(`Punto de escaneo ${id} no encontrado`);
    return punto;
  }

  async actualizarPunto(id: string, dto: ActualizarPuntoDto) {
    const punto = await this.puntoOrThrow(id);
    try {
      await this.prisma.puntoEscaneo.update({ where: { id }, data: dto });
    } catch (error) {
      throw this.aConflictoSiCodigoDuplicado(error);
    }
    return this.trayectoAdminOrThrow(punto.evento.trayectoId);
  }

  async eliminarPunto(id: string) {
    const punto = await this.puntoOrThrow(id);
    await this.prisma.puntoEscaneo.delete({ where: { id } });
    return this.trayectoAdminOrThrow(punto.evento.trayectoId);
  }

  // El código va escrito en un QR físico — si dos puntos terminan con el
  // mismo, Prisma rechaza el create/update con P2025 (unique constraint);
  // se traduce a un 409 con mensaje claro en vez del 500 genérico.
  private aConflictoSiCodigoDuplicado(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException('Ese código ya está en uso, prueba otro.');
    }
    return error;
  }

  async crearRango(trayectoId: string, dto: CrearRangoDto) {
    await this.trayectoAdminOrThrow(trayectoId);
    // Igual que Evento: el orden se agrega al final, se reordena aparte.
    const orden = (await this.prisma.rango.count({ where: { trayectoId } })) + 1;
    await this.prisma.rango.create({
      data: {
        nombre: dto.nombre,
        orden,
        trayectoId,
        eventos: { connect: dto.eventoIds.map((id) => ({ id })) },
      },
    });
    return this.trayectoAdminOrThrow(trayectoId);
  }

  async reordenarRangos(trayectoId: string, ids: string[]) {
    await this.trayectoAdminOrThrow(trayectoId);
    await this.prisma.$transaction(
      ids.map((id, i) => this.prisma.rango.update({ where: { id }, data: { orden: i + 1 } })),
    );
    return this.trayectoAdminOrThrow(trayectoId);
  }

  private async rangoOrThrow(id: string) {
    const rango = await this.prisma.rango.findUnique({ where: { id } });
    if (!rango) throw new NotFoundException(`Rango ${id} no encontrado`);
    return rango;
  }

  async actualizarRango(id: string, dto: ActualizarRangoDto) {
    const rango = await this.rangoOrThrow(id);
    const { eventoIds, ...resto } = dto;
    await this.prisma.rango.update({
      where: { id },
      data: {
        ...resto,
        ...(eventoIds ? { eventos: { set: eventoIds.map((eventoId) => ({ id: eventoId })) } } : {}),
      },
    });
    return this.trayectoAdminOrThrow(rango.trayectoId);
  }

  async eliminarRango(id: string) {
    const rango = await this.rangoOrThrow(id);
    await this.prisma.rango.delete({ where: { id } });
    return this.trayectoAdminOrThrow(rango.trayectoId);
  }

  // Medalla ya no cuelga de ningún trayecto (ver comentario en el schema) —
  // estos métodos operan directo sobre la tabla, sin pasar por
  // `trayectoAdminOrThrow`.
  listarMedallasAdmin() {
    return this.prisma.medalla.findMany({ orderBy: { orden: 'asc' } });
  }

  async crearMedallaGlobal(dto: CrearMedallaDto): Promise<Medalla> {
    // Igual que Evento/Rango: se agrega al final, se reordena aparte.
    const orden = (await this.prisma.medalla.count()) + 1;
    return this.prisma.medalla.create({ data: { ...dto, orden } });
  }

  async reordenarMedallas(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, i) => this.prisma.medalla.update({ where: { id }, data: { orden: i + 1 } })),
    );
    return this.listarMedallasAdmin();
  }

  private async medallaOrThrow(id: string) {
    const medalla = await this.prisma.medalla.findUnique({ where: { id } });
    if (!medalla) throw new NotFoundException(`Medalla ${id} no encontrada`);
    return medalla;
  }

  async actualizarMedalla(id: string, dto: ActualizarMedallaDto) {
    await this.medallaOrThrow(id);
    return this.prisma.medalla.update({ where: { id }, data: dto });
  }

  async eliminarMedalla(id: string) {
    await this.medallaOrThrow(id);
    await this.prisma.medalla.delete({ where: { id } });
  }

  // ── Reportes ─────────────────────────────────────────────────────────────
  // Solo cuentan visitantes REALES (logueados con Google) — un UUID anónimo
  // suelto no se puede mostrar en un ranking o reporte con nombre/email, así
  // que no hay forma de identificarlo ante el admin.

  // Ranking de visitantes por cantidad total de sellos (cualquier trayecto).
  async listarVisitantesAdmin() {
    const [visitantes, conteos] = await Promise.all([
      this.prisma.visitante.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.escaneoPunto.groupBy({ by: ['visitorId'], _count: { _all: true } }),
    ]);

    const totalPorVisitante = new Map(conteos.map((c) => [c.visitorId, c._count._all]));

    return visitantes
      .map((v) => ({
        id: v.id,
        name: v.name,
        email: v.email,
        avatarUrl: v.avatarUrl,
        createdAt: v.createdAt,
        totalSellos: totalPorVisitante.get(v.id) ?? 0,
      }))
      .sort((a, b) => b.totalSellos - a.totalSellos);
  }

  // Base compartida por reportePorEvento/reportePorTrayecto: para cada
  // Evento, quiénes (visitantes REALES) lo completaron — misma regla que usa
  // `construirProgreso` (todos los puntos de al menos una instancia/grupo),
  // pero agregada para todo el mundo en vez de un solo visitante.
  private async completadosPorEvento() {
    const [eventos, visitantes, escaneos] = await Promise.all([
      this.prisma.evento.findMany({
        orderBy: [{ trayectoId: 'asc' }, { orden: 'asc' }],
        include: { trayecto: { select: { id: true, nombre: true } }, puntos: { select: { id: true, instancia: true } } },
      }),
      this.prisma.visitante.findMany({ select: { id: true } }),
      this.prisma.escaneoPunto.findMany({ select: { visitorId: true, puntoId: true } }),
    ]);

    const idsVisitantesReales = new Set(visitantes.map((v) => v.id));
    const visitantesPorPunto = new Map<string, Set<string>>();
    for (const escaneo of escaneos) {
      if (!idsVisitantesReales.has(escaneo.visitorId)) continue;
      const set = visitantesPorPunto.get(escaneo.puntoId) ?? new Set<string>();
      set.add(escaneo.visitorId);
      visitantesPorPunto.set(escaneo.puntoId, set);
    }

    return eventos.map((evento) => {
      const grupos = new Map<string, typeof evento.puntos>();
      for (const punto of evento.puntos) {
        const clave = punto.instancia ?? '__unico__';
        const grupo = grupos.get(clave) ?? [];
        grupo.push(punto);
        grupos.set(clave, grupo);
      }

      // Un visitante completa el evento si completó AL MENOS UNO de sus
      // grupos (intersección de quienes escanearon TODOS los puntos de ese
      // grupo), igual que en `construirProgreso`.
      const visitantesQueCompletaron = new Set<string>();
      for (const puntos of grupos.values()) {
        if (puntos.length === 0) continue;
        let interseccion: Set<string> | null = null;
        for (const punto of puntos) {
          const visitantesDelPunto = visitantesPorPunto.get(punto.id) ?? new Set<string>();
          interseccion = interseccion
            ? new Set([...interseccion].filter((v) => visitantesDelPunto.has(v)))
            : new Set(visitantesDelPunto);
        }
        interseccion?.forEach((v) => visitantesQueCompletaron.add(v));
      }

      return { evento, visitantesQueCompletaron };
    });
  }

  async reportePorEvento() {
    const datos = await this.completadosPorEvento();
    return datos.map(({ evento, visitantesQueCompletaron }) => ({
      eventoId: evento.id,
      eventoNombre: evento.nombre,
      trayectoNombre: evento.trayecto.nombre,
      totalPuntos: evento.puntos.length,
      visitantesCompletaron: visitantesQueCompletaron.size,
    }));
  }

  // Por cada Trayecto: cuántos visitantes REALES lo completaron ENTERO — o
  // sea, están en el set de "completó" de TODOS sus eventos (misma regla que
  // `trayectoCompleto` en `construirProgreso`).
  async reportePorTrayecto() {
    const datosEventos = await this.completadosPorEvento();

    const porTrayecto = new Map<string, { nombre: string; datos: typeof datosEventos }>();
    for (const dato of datosEventos) {
      const trayectoId = dato.evento.trayectoId;
      const entrada = porTrayecto.get(trayectoId) ?? { nombre: dato.evento.trayecto.nombre, datos: [] };
      entrada.datos.push(dato);
      porTrayecto.set(trayectoId, entrada);
    }

    return Array.from(porTrayecto.entries()).map(([trayectoId, { nombre, datos }]) => {
      let interseccion: Set<string> | null = null;
      for (const { visitantesQueCompletaron } of datos) {
        interseccion = interseccion
          ? new Set([...interseccion].filter((v) => visitantesQueCompletaron.has(v)))
          : new Set(visitantesQueCompletaron);
      }

      return {
        trayectoId,
        trayectoNombre: nombre,
        totalEventos: datos.length,
        visitantesCompletaron: interseccion?.size ?? 0,
      };
    });
  }
}

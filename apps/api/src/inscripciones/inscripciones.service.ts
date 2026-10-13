import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EstadoInscripcion } from "@repo/database";
import { PrismaService } from "../prisma/prisma.service";
import { CrearInscripcionDto } from "./dto/crear-inscripcion.dto";
import { edadEnFecha } from "./edad.util";
import type { AlcanceInscripciones } from "./alcance-inscripciones";
import {
  LadoFotoCi,
  ObjetivoFotoDto,
  TipoObjetivoFoto,
} from "./dto/subir-fotos.dto";
import {
  STORAGE_SERVICE,
  type StorageService,
} from "../storage/storage.interface";

// No dependemos de los tipos de Multer/Express (no está instalado
// @types/multer) — solo se necesita esto de cada archivo subido.
interface ArchivoSubido {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

import { ActualizarInscripcionDto } from "./dto/actualizar-inscripcion.dto";
import { cumpleRangoEdad } from "./edad.util";

export type TipoInscripcion = "CANTANTE" | "GRUPO";

// Campos de ActualizarInscripcionDto que existen en cada modelo — Cantante y
// Grupo no comparten todos los campos (ej. ciNumero es solo de Cantante), y
// Prisma rechaza en tiempo de ejecución cualquier campo ajeno al modelo.
const CAMPOS_CANTANTE = [
  "nombre",
  "pseudonimo",
  "tituloTema",
  "autorCompositor",
  "ritmo",
  "tiempo",
  "departamento",
  "fotoUrl",
  "videoUrl",
  "celular1",
  "celular2",
  "ciNumero",
  "ciExtension",
  "fechaNacimiento",
  "whatsapp",
  "direccion",
  "adultoResponsableNombre",
  "adultoResponsableCiNumero",
  "adultoResponsableCiExtension",
  "adultoResponsableCelular",
  "autorizaParticipacionAdultoResponsable",
] as const;

const CAMPOS_GRUPO = [
  "nombre",
  "pseudonimo",
  "tituloTema",
  "autorCompositor",
  "ritmo",
  "tiempo",
  "departamento",
  "fotoUrl",
  "videoUrl",
  "celular1",
  "celular2",
] as const;

function filtrarCampos<T extends readonly string[]>(
  dto: ActualizarInscripcionDto,
  campos: T,
) {
  const data: Record<string, unknown> = {};
  for (const campo of campos) {
    const valor = (dto as Record<string, unknown>)[campo];
    if (valor === undefined) continue;
    data[campo] =
      campo === "fechaNacimiento" ? new Date(valor as string) : valor;
  }
  return data;
}

@Injectable()
export class InscripcionesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService,
  ) {}

  async crear(dto: CrearInscripcionDto) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { nombre: dto.categoria },
    });
    if (!categoria) {
      throw new NotFoundException(`No existe la categoría "${dto.categoria}"`);
    }

    if (
      dto.integrantes.length < categoria.integrantesMin ||
      dto.integrantes.length > categoria.integrantesMax
    ) {
      const rango =
        categoria.integrantesMin === categoria.integrantesMax
          ? `exactamente ${categoria.integrantesMin}`
          : `entre ${categoria.integrantesMin} y ${categoria.integrantesMax}`;
      throw new BadRequestException(
        `La categoría "${dto.categoria}" exige ${rango} integrante(s), llegaron ${dto.integrantes.length}`,
      );
    }

    const cantidadAcompanantes = dto.acompanantes?.length ?? 0;
    if (cantidadAcompanantes > categoria.acompanantesMax) {
      throw new BadRequestException(
        `La categoría "${dto.categoria}" permite hasta ${categoria.acompanantesMax} acompañante(s), llegaron ${cantidadAcompanantes}`,
      );
    }

    if (categoria.edadMinima != null || categoria.edadMaxima != null) {
      for (const integrante of dto.integrantes) {
        if (
          !cumpleRangoEdad(
            new Date(integrante.fechaNacimiento),
            categoria.edadMinima,
            categoria.edadMaxima,
          )
        ) {
          const rango =
            categoria.edadMinima != null && categoria.edadMaxima != null
              ? `entre ${categoria.edadMinima} y ${categoria.edadMaxima} años`
              : categoria.edadMinima != null
                ? `al menos ${categoria.edadMinima} años`
                : `como máximo ${categoria.edadMaxima} años`;
          throw new BadRequestException(
            `La categoría "${dto.categoria}" exige tener ${rango} al 10 de septiembre de 2026`,
          );
        }
      }
    }

    // No alcanza con el flag fijo de la categoría: la documentación de Ñusta
    // (16-25 años) dice literal "En caso de ser menor de edad, una carta de
    // autorización... *Anexo 4" — una postulante de 16-17 es menor (mayoría
    // de edad en Bolivia: 18 años) aunque Ñusta no esté marcada como
    // categoría "infantil". Se detecta por la fecha de nacimiento del único
    // integrante en categorías individuales (en grupales queda pendiente).
    const esIndividual = categoria.integrantesMax <= 1;
    const postulante = dto.integrantes[0];
    const postulanteEsMenorDeEdad =
      esIndividual &&
      !!postulante?.fechaNacimiento &&
      edadEnFecha(new Date(postulante.fechaNacimiento)) < 18;
    const requiereAdultoResponsable =
      categoria.requiereAdultoResponsable || postulanteEsMenorDeEdad;

    if (
      requiereAdultoResponsable &&
      (!dto.adultoResponsableNombre?.trim() ||
        !dto.adultoResponsableCiNumero?.trim() ||
        !dto.adultoResponsableCelular?.trim())
    ) {
      throw new BadRequestException(
        `La categoría "${dto.categoria}" exige nombre, C.I. y celular de un adulto responsable (padre, madre o tutor legal)${
          postulanteEsMenorDeEdad && !categoria.requiereAdultoResponsable
            ? " porque el/la postulante es menor de edad"
            : ""
        }`,
      );
    }

    if (
      requiereAdultoResponsable &&
      !dto.autorizaParticipacionAdultoResponsable
    ) {
      throw new BadRequestException(
        `La categoría "${dto.categoria}" exige la autorización del adulto responsable para la participación del o la menor`,
      );
    }

    const duracion = Number(dto.tiempo);
    if (!Number.isNaN(duracion) && duracion > categoria.duracionMaximaMinutos) {
      throw new BadRequestException(
        `La categoría "${dto.categoria}" exige una duración máxima de ${categoria.duracionMaximaMinutos} minutos`,
      );
    }

    const datosGenerales = {
      pseudonimo: dto.pseudonimo,
      tituloTema: dto.tituloTema,
      autorCompositor: dto.autorCompositor,
      ritmo: dto.ritmo,
      tiempo: dto.tiempo,
      departamento: dto.departamento,
      categoriaId: categoria.id,
      celular1: dto.celular1,
      celular2: dto.celular2,
      aceptaBases: dto.aceptaBases,
      declaracionVoluntaria: dto.declaracionVoluntaria,
    };

    if (categoria.integrantesMax > 1) {
      return this.prisma.grupo.create({
        data: {
          ...datosGenerales,
          nombre: dto.nombrePostulante,
          integrantes: {
            create: dto.integrantes.map((integrante) => ({
              nombre: integrante.nombre,
              instrumento: integrante.instrumento,
              ciNumero: integrante.ciNumero,
              ciExtension: integrante.ciExtension,
              fechaNacimiento: new Date(integrante.fechaNacimiento),
              whatsapp: integrante.whatsapp,
              direccion: integrante.direccion,
            })),
          },
        },
        include: { categoria: true, integrantes: true },
      });
    }

    const [integrante] = dto.integrantes;
    return this.prisma.cantante.create({
      data: {
        ...datosGenerales,
        nombre: dto.nombrePostulante,
        ciNumero: integrante.ciNumero,
        ciExtension: integrante.ciExtension,
        fechaNacimiento: new Date(integrante.fechaNacimiento),
        whatsapp: integrante.whatsapp,
        direccion: integrante.direccion,
        adultoResponsableNombre: dto.adultoResponsableNombre,
        adultoResponsableCiNumero: dto.adultoResponsableCiNumero,
        adultoResponsableCiExtension: dto.adultoResponsableCiExtension,
        adultoResponsableCelular: dto.adultoResponsableCelular,
        autorizaParticipacionAdultoResponsable:
          dto.autorizaParticipacionAdultoResponsable ?? false,
        acompanantes: {
          create: (dto.acompanantes ?? []).map((acompanante) => ({
            nombre: acompanante.nombre,
            ciNumero: acompanante.ciNumero,
            ciExtension: acompanante.ciExtension,
            instrumento: acompanante.instrumento,
          })),
        },
      },
      include: { categoria: true, acompanantes: true },
    });
  }

  async listarPendientes(
    estado: EstadoInscripcion | undefined,
    alcance: AlcanceInscripciones,
  ) {
    // Sin alcance (p. ej. un USER sin departamento asignado) no ve nada.
    if (!alcance) return [];

    const where = { ...(estado && { estado }), ...alcance };
    const [cantantes, grupos] = await Promise.all([
      this.prisma.cantante.findMany({
        where,
        include: { categoria: true, acompanantes: true },
      }),
      this.prisma.grupo.findMany({
        where,
        include: { categoria: true, integrantes: true },
      }),
    ]);

    const items = [
      ...cantantes.map((cantante) => ({
        tipo: "CANTANTE" as const,
        ...cantante,
      })),
      ...grupos.map((grupo) => ({ tipo: "GRUPO" as const, ...grupo })),
    ];

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async obtenerUno(tipo: string, id: string, alcance: AlcanceInscripciones) {
    const tipoNormalizado = tipo.toUpperCase();

    if (tipoNormalizado === "CANTANTE") {
      // findFirst con el alcance en el where: una inscripción de otro
      // departamento responde 404, igual que si no existiera.
      const cantante = alcance
        ? await this.prisma.cantante.findFirst({
            where: { id, ...alcance },
            include: { categoria: true, acompanantes: true },
          })
        : null;
      if (!cantante) {
        throw new NotFoundException(`Cantante ${id} no encontrado`);
      }
      return { tipo: "CANTANTE" as const, ...cantante };
    }

    if (tipoNormalizado === "GRUPO") {
      const grupo = alcance
        ? await this.prisma.grupo.findFirst({
            where: { id, ...alcance },
            include: { categoria: true, integrantes: true },
          })
        : null;
      if (!grupo) {
        throw new NotFoundException(`Grupo ${id} no encontrado`);
      }
      return { tipo: "GRUPO" as const, ...grupo };
    }

    throw new BadRequestException(
      `Tipo de inscripción inválido: "${tipo}" (use CANTANTE o GRUPO)`,
    );
  }

  async actualizar(tipo: string, id: string, dto: ActualizarInscripcionDto) {
    const tipoNormalizado = tipo.toUpperCase();

    if (tipoNormalizado === "CANTANTE") {
      const cantante = await this.prisma.cantante.findUnique({ where: { id } });
      if (!cantante) {
        throw new NotFoundException(`Cantante ${id} no encontrado`);
      }
      return this.prisma.cantante.update({
        where: { id },
        data: filtrarCampos(dto, CAMPOS_CANTANTE),
        include: { categoria: true, acompanantes: true },
      });
    }

    if (tipoNormalizado === "GRUPO") {
      const grupo = await this.prisma.grupo.findUnique({ where: { id } });
      if (!grupo) {
        throw new NotFoundException(`Grupo ${id} no encontrado`);
      }
      return this.prisma.grupo.update({
        where: { id },
        data: filtrarCampos(dto, CAMPOS_GRUPO),
        include: { categoria: true, integrantes: true },
      });
    }

    throw new BadRequestException(
      `Tipo de inscripción inválido: "${tipo}" (use CANTANTE o GRUPO)`,
    );
  }

  // Borrado definitivo desde el panel (solo ADMIN). Integrantes, acompañantes
  // y canciones adicionales de Ñusta se van en cascada (onDelete: Cascade).
  // Las fotos/PDFs ya subidos al storage no se borran: StorageService no
  // tiene operación de borrado todavía.
  async eliminar(tipo: string, id: string) {
    const tipoNormalizado = tipo.toUpperCase();

    if (tipoNormalizado === "CANTANTE") {
      const cantante = await this.prisma.cantante.findUnique({ where: { id } });
      if (!cantante) throw new NotFoundException(`Cantante ${id} no encontrado`);
      await this.prisma.cantante.delete({ where: { id } });
      return { id, tipo: "CANTANTE" };
    }
    if (tipoNormalizado === "GRUPO") {
      const grupo = await this.prisma.grupo.findUnique({ where: { id } });
      if (!grupo) throw new NotFoundException(`Grupo ${id} no encontrado`);
      await this.prisma.grupo.delete({ where: { id } });
      return { id, tipo: "GRUPO" };
    }
    throw new BadRequestException(
      `Tipo de inscripción inválido: "${tipo}" (use CANTANTE o GRUPO)`,
    );
  }

  async actualizarEstado(
    tipo: string,
    id: string,
    estado: EstadoInscripcion,
    alcance: AlcanceInscripciones,
  ) {
    const tipoNormalizado = tipo.toUpperCase();

    if (tipoNormalizado === "CANTANTE") {
      return this.actualizarEstadoCantante(id, estado, alcance);
    }
    if (tipoNormalizado === "GRUPO") {
      return this.actualizarEstadoGrupo(id, estado, alcance);
    }
    throw new BadRequestException(
      `Tipo de inscripción inválido: "${tipo}" (use CANTANTE o GRUPO)`,
    );
  }

  private async actualizarEstadoCantante(
    id: string,
    estado: EstadoInscripcion,
    alcance: AlcanceInscripciones,
  ) {
    const cantante = alcance
      ? await this.prisma.cantante.findFirst({ where: { id, ...alcance } })
      : null;
    if (!cantante) {
      throw new NotFoundException(`Cantante ${id} no encontrado`);
    }
    return this.prisma.cantante.update({
      where: { id },
      data: { estado },
      include: { categoria: true, acompanantes: true },
    });
  }

  private async actualizarEstadoGrupo(
    id: string,
    estado: EstadoInscripcion,
    alcance: AlcanceInscripciones,
  ) {
    const grupo = alcance
      ? await this.prisma.grupo.findFirst({ where: { id, ...alcance } })
      : null;
    if (!grupo) {
      throw new NotFoundException(`Grupo ${id} no encontrado`);
    }
    return this.prisma.grupo.update({
      where: { id },
      data: { estado },
      include: { categoria: true, integrantes: true },
    });
  }

  // Fotos del carnet de identidad (anverso/reverso) de cada participante —
  // subida separada del POST /inscripciones principal a propósito: para
  // cuando esto se llama, Prisma ya generó los IDs reales de cada
  // Acompanante/GrupoIntegrante, así que cada foto puede apuntar a su
  // registro exacto. Anti-fraude (CAPTCHA, C.I. duplicado, rate limit)
  // queda pendiente para una pasada aparte, no entra acá todavía.
  async subirFotos(
    tipo: string,
    id: string,
    archivos: ArchivoSubido[],
    objetivos: ObjetivoFotoDto[],
  ) {
    if (archivos.length !== objetivos.length) {
      throw new BadRequestException(
        "La cantidad de archivos no coincide con la cantidad de objetivos",
      );
    }

    const tipoNormalizado = tipo.toUpperCase();
    if (tipoNormalizado !== "CANTANTE" && tipoNormalizado !== "GRUPO") {
      throw new BadRequestException(
        `Tipo de inscripción inválido: "${tipo}" (use CANTANTE o GRUPO)`,
      );
    }

    if (tipoNormalizado === "CANTANTE") {
      const cantante = await this.prisma.cantante.findUnique({
        where: { id },
        include: { acompanantes: true },
      });
      if (!cantante) {
        throw new NotFoundException(`Cantante ${id} no encontrado`);
      }

      let guardadas = 0;
      for (let i = 0; i < archivos.length; i++) {
        const objetivo = objetivos[i];
        const archivo = archivos[i];

        if (objetivo.tipo === TipoObjetivoFoto.POSTULANTE) {
          const url = await this.storageService.guardarArchivo(
            archivo.buffer,
            archivo.originalname,
            archivo.mimetype,
          );
          await this.prisma.cantante.update({
            where: { id },
            data:
              objetivo.lado === LadoFotoCi.REVERSO
                ? { fotoCiReversoUrl: url }
                : { fotoCiAnversoUrl: url },
          });
        } else if (objetivo.tipo === TipoObjetivoFoto.ADULTO_RESPONSABLE) {
          const url = await this.storageService.guardarArchivo(
            archivo.buffer,
            archivo.originalname,
            archivo.mimetype,
          );
          await this.prisma.cantante.update({
            where: { id },
            data:
              objetivo.lado === LadoFotoCi.REVERSO
                ? { adultoResponsableFotoCiReversoUrl: url }
                : { adultoResponsableFotoCiAnversoUrl: url },
          });
        } else if (objetivo.tipo === TipoObjetivoFoto.ACOMPANANTE) {
          if (
            !objetivo.id ||
            !cantante.acompanantes.some((a) => a.id === objetivo.id)
          ) {
            throw new BadRequestException(
              `El acompañante "${objetivo.id}" no pertenece a este postulante`,
            );
          }
          const url = await this.storageService.guardarArchivo(
            archivo.buffer,
            archivo.originalname,
            archivo.mimetype,
          );
          await this.prisma.acompanante.update({
            where: { id: objetivo.id },
            data:
              objetivo.lado === LadoFotoCi.REVERSO
                ? { fotoCiReversoUrl: url }
                : { fotoCiAnversoUrl: url },
          });
        } else {
          throw new BadRequestException(
            `El objetivo "${objetivo.tipo}" no es válido para un Cantante`,
          );
        }
        guardadas++;
      }
      return { guardadas };
    }

    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      include: { integrantes: true },
    });
    if (!grupo) {
      throw new NotFoundException(`Grupo ${id} no encontrado`);
    }

    let guardadas = 0;
    for (let i = 0; i < archivos.length; i++) {
      const objetivo = objetivos[i];
      const archivo = archivos[i];

      if (objetivo.tipo === TipoObjetivoFoto.INTEGRANTE) {
        if (
          !objetivo.id ||
          !grupo.integrantes.some((integrante) => integrante.id === objetivo.id)
        ) {
          throw new BadRequestException(
            `El integrante "${objetivo.id}" no pertenece a este grupo`,
          );
        }
        const url = await this.storageService.guardarArchivo(
          archivo.buffer,
          archivo.originalname,
          archivo.mimetype,
        );
        await this.prisma.grupoIntegrante.update({
          where: { id: objetivo.id },
          data:
            objetivo.lado === LadoFotoCi.REVERSO
              ? { fotoCiReversoUrl: url }
              : { fotoCiAnversoUrl: url },
        });
      } else if (objetivo.tipo === TipoObjetivoFoto.GRUPO_CARNETS_BULK) {
        const url = await this.storageService.guardarArchivo(
          archivo.buffer,
          archivo.originalname,
          archivo.mimetype,
        );
        await this.prisma.grupo.update({
          where: { id },
          data: { fotosCarnetsGrupalUrls: { push: url } },
        });
      } else {
        throw new BadRequestException(
          `El objetivo "${objetivo.tipo}" no es válido para un Grupo`,
        );
      }
      guardadas++;
    }
    return { guardadas };
  }

  // PDF del "plan de promoción del festival" — solo lo pide la convocatoria
  // para la categoría Ñusta ("a ejecutar en caso de ser coronada"). Endpoint
  // separado de subirFotos: es un documento de otra naturaleza (no una foto
  // de carnet), así que no tiene sentido sumarlo al DTO de objetivos de ahí.
  async subirPlanPromocion(tipo: string, id: string, archivo: ArchivoSubido) {
    if (tipo.toUpperCase() !== "CANTANTE") {
      throw new BadRequestException(
        'El plan de promoción solo aplica a postulantes individuales (tipo "cantante")',
      );
    }

    const cantante = await this.prisma.cantante.findUnique({
      where: { id },
      include: { categoria: true },
    });
    if (!cantante) {
      throw new NotFoundException(`Cantante ${id} no encontrado`);
    }
    if (cantante.categoria.nombre !== "Ñusta") {
      throw new BadRequestException(
        'El plan de promoción solo aplica a la categoría "Ñusta"',
      );
    }

    const url = await this.storageService.guardarArchivo(
      archivo.buffer,
      archivo.originalname,
      archivo.mimetype,
      "documentos",
    );
    await this.prisma.cantante.update({
      where: { id },
      data: { planPromocionUrl: url },
    });
    return { url };
  }

  // Consulta pública de /verifica-tu-inscripcion: solo responde si el C.I.
  // figura en alguna postulación (como solista, integrante de grupo o
  // acompañante) y si fue rechazada — a propósito no devuelve nombre,
  // categoría ni ningún otro dato, para no filtrar información personal.
  async verificar(ciNumero: string) {
    const ci = { equals: ciNumero.trim(), mode: "insensitive" as const };

    const [cantantes, acompanantes, integrantes] = await Promise.all([
      this.prisma.cantante.findMany({
        where: { ciNumero: ci },
        select: { estado: true },
      }),
      this.prisma.acompanante.findMany({
        where: { ciNumero: ci },
        select: { cantante: { select: { estado: true } } },
      }),
      this.prisma.grupoIntegrante.findMany({
        where: { ciNumero: ci },
        select: { grupo: { select: { estado: true } } },
      }),
    ]);

    const estados = [
      ...cantantes.map((c) => c.estado),
      ...acompanantes.map((a) => a.cantante.estado),
      ...integrantes.map((i) => i.grupo.estado),
    ];

    if (estados.length === 0) return { estado: "NO_INSCRITO" as const };
    // Con varias postulaciones, basta una vigente para contar como inscrito.
    const todasRechazadas = estados.every(
      (e) => e === EstadoInscripcion.RECHAZADO,
    );
    return { estado: todasRechazadas ? ("RECHAZADO" as const) : ("INSCRITO" as const) };
  }
}

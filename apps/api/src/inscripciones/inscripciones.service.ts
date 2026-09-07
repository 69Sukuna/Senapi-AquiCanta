import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EstadoInscripcion } from '@repo/database';
import { PrismaService } from '../prisma/prisma.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { cumpleRangoEdad } from './edad.util';

export type TipoInscripcion = 'CANTANTE' | 'GRUPO';

@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearInscripcionDto) {
    const categoria = await this.prisma.categoria.findUnique({ where: { nombre: dto.categoria } });
    if (!categoria) {
      throw new NotFoundException(`No existe la categoría "${dto.categoria}"`);
    }

    if (dto.integrantes.length < categoria.integrantesMin || dto.integrantes.length > categoria.integrantesMax) {
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
        if (!cumpleRangoEdad(new Date(integrante.fechaNacimiento), categoria.edadMinima, categoria.edadMaxima)) {
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

    if (
      categoria.requiereAdultoResponsable &&
      (!dto.adultoResponsableNombre?.trim() ||
        !dto.adultoResponsableCiNumero?.trim() ||
        !dto.adultoResponsableCelular?.trim())
    ) {
      throw new BadRequestException(
        `La categoría "${dto.categoria}" exige nombre, C.I. y celular de un adulto responsable (padre, madre o tutor legal)`,
      );
    }

    if (categoria.requiereAdultoResponsable && !dto.autorizaParticipacionAdultoResponsable) {
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
        autorizaParticipacionAdultoResponsable: dto.autorizaParticipacionAdultoResponsable ?? false,
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

  async listarPendientes(estado?: EstadoInscripcion) {
    const [cantantes, grupos] = await Promise.all([
      this.prisma.cantante.findMany({
        where: estado ? { estado } : undefined,
        include: { categoria: true, acompanantes: true },
      }),
      this.prisma.grupo.findMany({
        where: estado ? { estado } : undefined,
        include: { categoria: true, integrantes: true },
      }),
    ]);

    const items = [
      ...cantantes.map((cantante) => ({ tipo: 'CANTANTE' as const, ...cantante })),
      ...grupos.map((grupo) => ({ tipo: 'GRUPO' as const, ...grupo })),
    ];

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async actualizarEstado(tipo: string, id: string, estado: EstadoInscripcion) {
    const tipoNormalizado = tipo.toUpperCase();

    if (tipoNormalizado === 'CANTANTE') {
      return this.actualizarEstadoCantante(id, estado);
    }
    if (tipoNormalizado === 'GRUPO') {
      return this.actualizarEstadoGrupo(id, estado);
    }
    throw new BadRequestException(`Tipo de inscripción inválido: "${tipo}" (use CANTANTE o GRUPO)`);
  }

  private async actualizarEstadoCantante(id: string, estado: EstadoInscripcion) {
    const cantante = await this.prisma.cantante.findUnique({ where: { id } });
    if (!cantante) {
      throw new NotFoundException(`Cantante ${id} no encontrado`);
    }
    return this.prisma.cantante.update({ where: { id }, data: { estado } });
  }

  private async actualizarEstadoGrupo(id: string, estado: EstadoInscripcion) {
    const grupo = await this.prisma.grupo.findUnique({ where: { id } });
    if (!grupo) {
      throw new NotFoundException(`Grupo ${id} no encontrado`);
    }
    return this.prisma.grupo.update({ where: { id }, data: { estado } });
  }
}

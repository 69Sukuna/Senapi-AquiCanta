import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EstadoInscripcion } from '@repo/database';
import { PrismaService } from '../prisma/prisma.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';

export type TipoInscripcion = 'CANTANTE' | 'GRUPO';

@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearInscripcionDto) {
    const categoria = await this.prisma.categoria.findUnique({ where: { nombre: dto.categoria } });
    if (!categoria) {
      throw new NotFoundException(`No existe la categoría "${dto.categoria}"`);
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

    if (categoria.esGrupal) {
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
              edad: integrante.edad,
              whatsapp: integrante.whatsapp,
              direccion: integrante.direccion,
            })),
          },
        },
        include: { categoria: true, integrantes: true },
      });
    }

    if (dto.integrantes.length !== 1) {
      throw new BadRequestException(
        `La categoría "${dto.categoria}" es individual: se esperaba 1 integrante, llegaron ${dto.integrantes.length}`,
      );
    }

    const [integrante] = dto.integrantes;
    return this.prisma.cantante.create({
      data: {
        ...datosGenerales,
        nombre: dto.nombrePostulante,
        ciNumero: integrante.ciNumero,
        ciExtension: integrante.ciExtension,
        edad: integrante.edad,
        whatsapp: integrante.whatsapp,
        direccion: integrante.direccion,
      },
      include: { categoria: true },
    });
  }

  async listarPendientes(estado?: EstadoInscripcion) {
    const [cantantes, grupos] = await Promise.all([
      this.prisma.cantante.findMany({
        where: estado ? { estado } : undefined,
        include: { categoria: true },
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

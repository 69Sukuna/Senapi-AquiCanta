import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Solo "datos generales" (ver Anexo 1): nunca se exponen acá ciNumero,
// ciExtension, fechaNacimiento, whatsapp, direccion, celular1, celular2 —
// esos son privados y solo se ven en /inscripciones (panel de administración).
const SELECT_PUBLICO = {
  id: true,
  nombre: true,
  pseudonimo: true,
  tituloTema: true,
  autorCompositor: true,
  ritmo: true,
  tiempo: true,
  videoUrl: true,
  departamento: true,
  fotoUrl: true,
  categoriaId: true,
  categoria: true,
  acompanantes: {
    select: {
      id: true,
      nombre: true,
      instrumento: true,
    },
  },
} as const;

@Injectable()
export class CantantesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cantante.findMany({
      where: { estado: 'APROBADO' },
      select: SELECT_PUBLICO,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const cantante = await this.prisma.cantante.findFirst({
      where: { id, estado: 'APROBADO' },
      select: SELECT_PUBLICO,
    });

    if (!cantante) {
      throw new NotFoundException(`Cantante ${id} no encontrado`);
    }

    return cantante;
  }
}

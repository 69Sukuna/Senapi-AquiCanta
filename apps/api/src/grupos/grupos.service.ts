import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Solo "datos generales" del grupo (ver Anexo 1) + los campos públicos de
// cada integrante. Nunca se exponen acá celular1/celular2 del grupo, ni
// ciNumero/ciExtension/edad/whatsapp/direccion de cada integrante — esos
// son privados y solo se ven en /inscripciones (panel de administración).
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
  integrantes: {
    select: {
      id: true,
      nombre: true,
      nombreReferencia: true,
      instrumento: true,
      fotoUrl: true,
    },
  },
} as const;

@Injectable()
export class GruposService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.grupo.findMany({
      where: { estado: 'APROBADO' },
      select: SELECT_PUBLICO,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const grupo = await this.prisma.grupo.findFirst({
      where: { id, estado: 'APROBADO' },
      select: SELECT_PUBLICO,
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo ${id} no encontrado`);
    }

    return grupo;
  }
}

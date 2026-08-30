import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GruposService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.grupo.findMany({
      include: { categoria: true, integrantes: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      include: { categoria: true, integrantes: true },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo ${id} no encontrado`);
    }

    return grupo;
  }
}

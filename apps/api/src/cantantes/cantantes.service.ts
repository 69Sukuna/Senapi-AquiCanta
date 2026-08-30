import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CantantesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cantante.findMany({
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const cantante = await this.prisma.cantante.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!cantante) {
      throw new NotFoundException(`Cantante ${id} no encontrado`);
    }

    return cantante;
  }
}

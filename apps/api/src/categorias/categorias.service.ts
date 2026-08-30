import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categoria.findUnique({ where: { id } });

    if (!categoria) {
      throw new NotFoundException(`Categoría ${id} no encontrada`);
    }

    return categoria;
  }
}

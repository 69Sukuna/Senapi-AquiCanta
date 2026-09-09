import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfiguracionVistaService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.configuracionVista.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findOne(clave: string) {
    const vista = await this.prisma.configuracionVista.findUnique({ where: { clave } });
    if (!vista) {
      throw new NotFoundException(`No existe una configuración de vista con clave "${clave}"`);
    }
    return vista;
  }

  async actualizar(clave: string, activo: boolean) {
    // findUnique primero (en vez de dejar que update tire P2025) para poder
    // devolver un 404 con mensaje claro — clave es fija (viene del código,
    // no la escribe un usuario), así que si no existe es porque falta
    // sembrarla, no un error del admin.
    await this.findOne(clave);
    return this.prisma.configuracionVista.update({ where: { clave }, data: { activo } });
  }
}

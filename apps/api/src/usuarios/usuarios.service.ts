import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, Role } from '@repo/database';
import { PrismaService } from '../prisma/prisma.service';
import type { UsuarioAutenticado } from '../auth/jwt-payload';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CrearUsuarioDto, ROLES_GESTIONABLES } from './dto/crear-usuario.dto';

// Nunca se devuelve `password` (ni el hash) — este select es la única forma
// en que el service lee usuarios hacia afuera.
const SELECT_PUBLICO = {
  id: true,
  email: true,
  username: true,
  name: true,
  role: true,
  departamento: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const ROUNDS_BCRYPT = 10;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.user.findMany({
      where: { role: { in: ROLES_GESTIONABLES } },
      select: SELECT_PUBLICO,
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async crear(dto: CrearUsuarioDto) {
    const departamento = dto.role === Role.USER ? (dto.departamento ?? null) : null;
    if (dto.role === Role.USER && !departamento) {
      throw new BadRequestException('Un usuario de departamento necesita un departamento asignado');
    }

    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username ?? null,
          name: dto.name ?? null,
          password: await bcrypt.hash(dto.password, ROUNDS_BCRYPT),
          role: dto.role,
          departamento,
        },
        select: SELECT_PUBLICO,
      });
    } catch (error) {
      throw this.aConflictoSiDuplicado(error);
    }
  }

  async actualizar(id: string, dto: ActualizarUsuarioDto, actor: UsuarioAutenticado) {
    const actual = await this.gestionableOrThrow(id);

    const rol = dto.role ?? actual.role;
    // Quitarte a vos mismo el rol ADMIN dejaría el panel sin acceso —
    // sobre todo mientras seas el único admin.
    if (actual.id === actor.id && rol !== Role.ADMIN) {
      throw new BadRequestException('No puedes quitarte tu propio rol de administrador');
    }

    const departamento = rol === Role.USER ? (dto.departamento !== undefined ? dto.departamento : actual.departamento) : null;
    if (rol === Role.USER && !departamento) {
      throw new BadRequestException('Un usuario de departamento necesita un departamento asignado');
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.username !== undefined && { username: dto.username }),
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.password !== undefined && { password: await bcrypt.hash(dto.password, ROUNDS_BCRYPT) }),
          role: rol,
          departamento,
        },
        select: SELECT_PUBLICO,
      });
    } catch (error) {
      throw this.aConflictoSiDuplicado(error);
    }
  }

  async eliminar(id: string, actor: UsuarioAutenticado) {
    const actual = await this.gestionableOrThrow(id);
    if (actual.id === actor.id) {
      throw new BadRequestException('No puedes eliminar tu propia cuenta');
    }
    await this.prisma.user.delete({ where: { id } });
    return { id };
  }

  // Solo cuentas ADMIN/USER: las ARTIST no se gestionan desde acá.
  private async gestionableOrThrow(id: string) {
    const usuario = await this.prisma.user.findFirst({
      where: { id, role: { in: ROLES_GESTIONABLES } },
      select: SELECT_PUBLICO,
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return usuario;
  }

  // email y username son únicos: Prisma rechaza con P2002 — se traduce a un
  // 409 que diga cuál de los dos está repetido, en vez del 500 genérico.
  private aConflictoSiDuplicado(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const campos = (error.meta?.target as string[] | undefined) ?? [];
      if (campos.includes('username')) return new ConflictException('Ese nombre de usuario ya está en uso');
      return new ConflictException('Ya existe una cuenta con ese email');
    }
    return error;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload, UsuarioAutenticado } from './jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(identificador: string, password: string) {
    const usuario = await this.prisma.user.findFirst({
      where: { OR: [{ email: identificador }, { username: identificador }] },
    });

    // Mismo mensaje genérico tanto si el usuario no existe como si el
    // password es incorrecto — no se debe revelar cuál de los dos falló.
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = { sub: usuario.id, role: usuario.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const usuarioAutenticado: UsuarioAutenticado = {
      id: usuario.id,
      email: usuario.email,
      username: usuario.username,
      name: usuario.name,
      role: usuario.role,
      departamento: usuario.departamento,
    };

    return { accessToken, usuario: usuarioAutenticado };
  }
}

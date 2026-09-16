import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { PerfilGoogle, VisitantePayload } from './visitante-payload';

@Injectable()
export class VisitantesAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Busca únicamente por `googleId` — a propósito NUNCA por email, para no
  // enlazar por accidente con una cuenta de `User` (admin/artista) ni con
  // otro Visitante que alguna vez haya usado ese mismo correo.
  async validarOAuthGoogle(perfil: PerfilGoogle) {
    if (!perfil.emailVerificado) {
      throw new UnauthorizedException('Tu cuenta de Google no tiene el email verificado');
    }

    const existente = await this.prisma.visitante.findUnique({ where: { googleId: perfil.googleId } });
    if (existente) {
      return this.prisma.visitante.update({
        where: { id: existente.id },
        data: { email: perfil.email, name: perfil.name, avatarUrl: perfil.avatarUrl },
      });
    }

    return this.prisma.visitante.create({
      data: { googleId: perfil.googleId, email: perfil.email, name: perfil.name, avatarUrl: perfil.avatarUrl },
    });
  }

  // Sesión de visitante bastante más larga que la de admin (12h) a propósito
  // — no tiene sentido pedirle a un visitante que vuelva a loguearse en
  // medio del festival.
  emitirToken(visitanteId: string): Promise<string> {
    const payload: VisitantePayload = { sub: visitanteId, typ: 'visitante' };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('VISITOR_JWT_SECRET'),
      expiresIn: '30d',
    });
  }
}

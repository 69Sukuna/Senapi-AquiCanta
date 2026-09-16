import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { VisitanteAutenticado, VisitantePayload } from '../visitante-payload';

// Estrategia separada de JwtStrategy (admin): nombre de estrategia distinto
// ('visitante-jwt' en vez de 'jwt') y, sobre todo, un secreto distinto
// (VISITOR_JWT_SECRET) — un token de admin nunca puede pasar por acá y
// viceversa, ni falsificando el payload.
@Injectable()
export class VisitanteJwtStrategy extends PassportStrategy(Strategy, 'visitante-jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('VISITOR_JWT_SECRET'),
    });
  }

  async validate(payload: VisitantePayload): Promise<VisitanteAutenticado> {
    if (payload.typ !== 'visitante') {
      throw new UnauthorizedException('Token inválido');
    }

    const visitante = await this.prisma.visitante.findUnique({ where: { id: payload.sub } });
    if (!visitante) {
      throw new UnauthorizedException('El visitante de este token ya no existe');
    }

    return { id: visitante.id, email: visitante.email, name: visitante.name, avatarUrl: visitante.avatarUrl };
  }
}

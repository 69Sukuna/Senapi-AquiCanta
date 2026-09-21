import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload, UsuarioAutenticado } from '../jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // El valor de retorno queda disponible como `request.user` en cualquier
  // ruta protegida por JwtAuthGuard (ver RolesGuard y @CurrentUser()).
  async validate(payload: JwtPayload): Promise<UsuarioAutenticado> {
    const usuario = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!usuario) {
      throw new UnauthorizedException('El usuario de este token ya no existe');
    }
    return {
      id: usuario.id,
      email: usuario.email,
      username: usuario.username,
      name: usuario.name,
      role: usuario.role,
      departamento: usuario.departamento,
    };
  }
}

import { Injectable, type ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { esRutaInternaSegura } from '../redirect-seguro.util';

// Dispara el redirect de consentimiento de Google. El `redirect` (a dónde
// volver en el frontend) viaja firmado dentro del `state` de OAuth en vez de
// ir suelto — evita que alguien arme un link que, después de loguearse,
// termine mandando al visitante a un dominio ajeno (open-redirect) o que se
// pueda alterar el destino desde afuera (CSRF sobre el propio state).
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const redirectSolicitado = req.query.redirect;
    const redirect = esRutaInternaSegura(redirectSolicitado) ? redirectSolicitado : '/';

    const state = this.jwtService.sign(
      { redirect },
      { secret: this.configService.getOrThrow<string>('VISITOR_JWT_SECRET'), expiresIn: '10m' },
    );

    return { state, scope: ['profile', 'email'] };
  }
}

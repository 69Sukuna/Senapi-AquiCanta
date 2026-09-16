import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { CurrentPerfilGoogle } from './decorators/current-perfil-google.decorator';
import { CurrentVisitante } from './decorators/current-visitante.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { VisitanteJwtAuthGuard } from './guards/visitante-jwt-auth.guard';
import { esRutaInternaSegura } from './redirect-seguro.util';
import type { PerfilGoogle, VisitanteAutenticado } from './visitante-payload';
import { VisitantesAuthService } from './visitantes-auth.service';

// `@Controller('auth')` coexiste con el AuthController de admin (métodos
// distintos, no chocan rutas) — las dos rutas de Google deben quedar
// exactamente en /auth/google y /auth/google/callback porque ya están
// registradas así como Authorized redirect URIs en Google Cloud Console.
@ApiTags('Auth (visitantes)')
@Controller('auth')
export class VisitantesAuthController {
  constructor(
    private readonly visitantesAuthService: VisitantesAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiExcludeEndpoint()
  iniciarGoogle() {
    // GoogleAuthGuard ya redirige a Google antes de llegar acá.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiExcludeEndpoint()
  async callbackGoogle(@CurrentPerfilGoogle() perfil: PerfilGoogle, @Query('state') state: string, @Res() res: Response) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    let redirect = '/';
    try {
      const decodificado = this.jwtService.verify<{ redirect: unknown }>(state, {
        secret: this.configService.getOrThrow<string>('VISITOR_JWT_SECRET'),
      });
      if (esRutaInternaSegura(decodificado.redirect)) {
        redirect = decodificado.redirect;
      }
    } catch {
      // `state` ausente/vencido/alterado: seguimos con el destino por
      // defecto en vez de romper todo el login por esto.
    }

    const visitante = await this.visitantesAuthService.validarOAuthGoogle(perfil);
    const token = await this.visitantesAuthService.emitirToken(visitante.id);

    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(redirect)}`);
  }

  @Get('visitante/me')
  @UseGuards(VisitanteJwtAuthGuard)
  @ApiOperation({ summary: 'Datos del visitante autenticado — usado por el frontend para validar el token guardado' })
  me(@CurrentVisitante() visitante: VisitanteAutenticado) {
    return visitante;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import type { PerfilGoogle } from '../visitante-payload';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  // A propósito solo devuelve el perfil ya extraído — el accessToken/
  // refreshToken de Google que llegan acá se descartan, no hace falta
  // seguir llamando a ninguna API de Google después del login.
  validate(_accessToken: string, _refreshToken: string, profile: Profile): PerfilGoogle {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Tu cuenta de Google no tiene un email disponible');
    }

    return {
      googleId: profile.id,
      email,
      name: profile.displayName || null,
      avatarUrl: profile.photos?.[0]?.value || null,
      // El tipo de @types/passport no declara `verified`, pero Google sí lo
      // manda en runtime. Se trata "no viene el campo" como verificado, y
      // solo se rechaza si viene explícitamente en false.
      emailVerificado: (profile.emails?.[0] as { verified?: boolean } | undefined)?.verified !== false,
    };
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { VisitantesAuthController } from './visitantes-auth.controller';
import { VisitantesAuthService } from './visitantes-auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { VisitanteJwtStrategy } from './strategies/visitante-jwt.strategy';
import { GoogleAuthGuard } from './guards/google-auth.guard';

// Módulo de identidad de VISITANTES, completamente aparte de AuthModule
// (admin/User) — su propio JwtModule usa VISITOR_JWT_SECRET, un secreto
// distinto al JWT_SECRET de AuthModule, así que ambos JwtService son
// instancias independientes y un token de un sistema nunca es válido en
// el otro (ver visitante-jwt.strategy.ts).
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('VISITOR_JWT_SECRET'),
      }),
    }),
  ],
  controllers: [VisitantesAuthController],
  providers: [VisitantesAuthService, GoogleStrategy, VisitanteJwtStrategy, GoogleAuthGuard],
})
export class VisitantesModule {}

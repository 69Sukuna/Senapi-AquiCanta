import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Exige un Bearer token de VISITANTE válido (ver VisitanteJwtStrategy) —
// completamente aparte de JwtAuthGuard (admin), no acepta ni valida tokens
// de esa otra estrategia.
@Injectable()
export class VisitanteJwtAuthGuard extends AuthGuard('visitante-jwt') {}

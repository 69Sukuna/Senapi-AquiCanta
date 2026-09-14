import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Exige un Bearer token válido (ver JwtStrategy). No exige ningún rol en
// particular — para eso se combina con RolesGuard en las rutas de admin.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

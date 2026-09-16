import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { PerfilGoogle } from '../visitante-payload';

// Solo se usa en GET /auth/google/callback: ahí `request.user` es el perfil
// que devolvió GoogleStrategy.validate(), todavía no un Visitante de la DB.
export const CurrentPerfilGoogle = createParamDecorator((_data: unknown, ctx: ExecutionContext): PerfilGoogle => {
  return ctx.switchToHttp().getRequest<{ user: PerfilGoogle }>().user;
});

import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { UsuarioAutenticado } from '../jwt-payload';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): UsuarioAutenticado => {
  return ctx.switchToHttp().getRequest<{ user: UsuarioAutenticado }>().user;
});

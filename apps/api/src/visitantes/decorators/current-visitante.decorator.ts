import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { VisitanteAutenticado } from '../visitante-payload';

export const CurrentVisitante = createParamDecorator((_data: unknown, ctx: ExecutionContext): VisitanteAutenticado => {
  return ctx.switchToHttp().getRequest<{ user: VisitanteAutenticado }>().user;
});

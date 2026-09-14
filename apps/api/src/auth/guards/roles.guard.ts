import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@repo/database';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UsuarioAutenticado } from '../jwt-payload';

// Se aplica DESPUÉS de JwtAuthGuard (que ya pobló request.user) en las rutas
// marcadas con @Roles(...) — sin ese decorador, deja pasar a cualquier
// usuario autenticado.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesRequeridos || rolesRequeridos.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{ user: UsuarioAutenticado }>();
    if (!rolesRequeridos.includes(user.role)) {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }
    return true;
  }
}

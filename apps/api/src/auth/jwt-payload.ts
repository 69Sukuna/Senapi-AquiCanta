import type { Role } from '@repo/database';

export interface JwtPayload {
  sub: string;
  role: Role;
}

export interface UsuarioAutenticado {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: Role;
}

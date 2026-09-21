import type { Departamento } from '@repo/database';
import type { UsuarioAutenticado } from '../auth/jwt-payload';

// Qué inscripciones puede ver y gestionar quien llama al panel:
//  - ADMIN: todas (filtro vacío).
//  - USER con departamento asignado: solo las de ese departamento.
//  - Cualquier otro caso (p. ej. USER sin departamento): ninguna (null).
// El filtro se aplica siempre en el servidor (no en el frontend), y se
// mezcla directo en el `where` de Prisma.
export type AlcanceInscripciones = { departamento?: Departamento } | null;

export function alcanceDe(usuario: UsuarioAutenticado): AlcanceInscripciones {
  if (usuario.role === 'ADMIN') return {};
  if (usuario.role === 'USER' && usuario.departamento) return { departamento: usuario.departamento };
  return null;
}

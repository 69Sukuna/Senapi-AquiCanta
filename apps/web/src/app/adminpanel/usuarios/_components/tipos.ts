// Coincide con lo que devuelve GET /usuarios (ver UsuariosService.SELECT_PUBLICO
// en la API — nunca incluye la contraseña).
export type RolGestionable = 'ADMIN' | 'USER';

export interface Usuario {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: RolGestionable;
  departamento: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ETIQUETA_ROL: Record<RolGestionable, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuario de departamento',
};

// La API (Nest) responde los errores como { message: string | string[] }.
export async function mensajeDeError(res: Response, porDefecto: string): Promise<string> {
  try {
    const data = await res.json();
    const mensaje = data?.message;
    if (Array.isArray(mensaje)) return mensaje.join('. ');
    if (typeof mensaje === 'string') return mensaje;
  } catch {
    // sin cuerpo JSON: se usa el mensaje por defecto.
  }
  return porDefecto;
}

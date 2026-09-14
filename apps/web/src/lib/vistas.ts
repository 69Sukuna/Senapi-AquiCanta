// Claves de las vistas públicas que el admin puede activar/desactivar desde
// /adminpanel/vistas (ver ConfiguracionVista en el schema de Prisma). Deben
// coincidir exactamente con las sembradas en packages/database/prisma/seed.ts.
export type ClaveVista = 'inscripciones' | 'votaciones' | 'butacas' | 'calificacion-jurado' | 'realidad-virtual';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Fail-open a propósito: si la API está caída o la vista todavía no fue
// sembrada, la página se muestra igual en vez de bloquear a todo el público
// por un problema del backend — el switch es una conveniencia del admin, no
// un control de seguridad.
export async function getVistaActiva(clave: ClaveVista): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/configuraciones-vista/${clave}`, { cache: 'no-store' });
    if (!res.ok) return true;
    const data = await res.json();
    return data.activo !== false;
  } catch {
    return true;
  }
}

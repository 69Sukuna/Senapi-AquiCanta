import { notFound } from 'next/navigation';
import { VistaCerrada } from '@/components/VistaCerrada';
import { getVistaActiva } from '@/lib/vistas';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { VotacionesContent } from './_components/VotacionesContent';

// El chequeo de activo/inactivo se hace acá (servidor), no dentro de
// VotacionesContent — así, si el admin apaga esta vista, el HTML de la
// votación ni siquiera se genera, en vez de depender de un fetch del lado
// del cliente que alguien podría bloquear (DevTools, un adblocker, etc.)
// para seguir viéndola. Ver InscripcionesPage para el mismo patrón.
export default async function VotacionesPage() {
  // Pestaña sacada del sitio (ver lib/featureFlags.ts): a diferencia del
  // check de abajo, este no depende del admin panel ni de la API — bloquea
  // la ruta pase lo que pase hasta que se reactive en código.
  if (!FEATURE_FLAGS.votaciones) {
    notFound();
  }

  const activa = await getVistaActiva('votaciones');
  if (!activa) {
    return <VistaCerrada nombre="Votaciones" descripcion="La votación no está abierta por el momento." />;
  }

  return <VotacionesContent />;
}

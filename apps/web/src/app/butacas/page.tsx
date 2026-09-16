import { notFound } from 'next/navigation';
import { VistaCerrada } from '@/components/VistaCerrada';
import { getVistaActiva } from '@/lib/vistas';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { ButacasContent } from './_components/ButacasContent';

// Ver votaciones/page.tsx para el porqué del chequeo en el servidor en vez
// de VistaGate (cliente): así no depende de un fetch que alguien pueda
// bloquear desde DevTools para seguir viendo la vista aunque esté apagada.
export default async function ButacasPage() {
  // Pestaña sacada del sitio (ver lib/featureFlags.ts): a diferencia del
  // check de abajo, este no depende del admin panel ni de la API — bloquea
  // la ruta pase lo que pase hasta que se reactive en código.
  if (!FEATURE_FLAGS.butacas) {
    notFound();
  }

  const activa = await getVistaActiva('butacas');
  if (!activa) {
    return <VistaCerrada nombre="Butacas" descripcion="La reserva de butacas no está disponible por el momento." />;
  }

  return <ButacasContent />;
}

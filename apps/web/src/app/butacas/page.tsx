import { VistaCerrada } from '@/components/VistaCerrada';
import { getVistaActiva } from '@/lib/vistas';
import { ButacasContent } from './_components/ButacasContent';

// Ver votaciones/page.tsx para el porqué del chequeo en el servidor en vez
// de VistaGate (cliente): así no depende de un fetch que alguien pueda
// bloquear desde DevTools para seguir viendo la vista aunque esté apagada.
export default async function ButacasPage() {
  const activa = await getVistaActiva('butacas');
  if (!activa) {
    return <VistaCerrada nombre="Butacas" descripcion="La reserva de butacas no está disponible por el momento." />;
  }

  return <ButacasContent />;
}

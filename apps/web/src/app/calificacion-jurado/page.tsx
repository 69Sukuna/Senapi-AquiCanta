import { VistaCerrada } from '@/components/VistaCerrada';
import { getVistaActiva } from '@/lib/vistas';
import { CalificacionJuradoContent } from './_components/CalificacionJuradoContent';

// Ver votaciones/page.tsx para el porqué del chequeo en el servidor en vez
// de VistaGate (cliente): así no depende de un fetch que alguien pueda
// bloquear desde DevTools para seguir viendo la vista aunque esté apagada.
export default async function CalificacionJuradoPage() {
  const activa = await getVistaActiva('calificacion-jurado');
  if (!activa) {
    return (
      <VistaCerrada nombre="Calificación del jurado" descripcion="La calificación del jurado no está disponible por el momento." />
    );
  }

  return <CalificacionJuradoContent />;
}

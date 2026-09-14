import HeroInscripcion from './components/HeroInscripcion';
import BannerCompletaFormulario from './components/BannerCompletaFormulario';
import FormularioInscripcion from './components/FormularioInscripcion';
import FaqInscripcion from './components/FaqInscripcion';
import BannerFechasClave from '@/components/BannerFechasClave';
import { VistaCerrada } from '@/components/VistaCerrada';
import { getVistaActiva } from '@/lib/vistas';

export default async function InscripcionesPage() {
  const activa = await getVistaActiva('inscripciones');
  if (!activa) {
    return <VistaCerrada nombre="Inscripciones" descripcion="Las inscripciones no están abiertas por el momento." />;
  }

  return (
    <main>
      <HeroInscripcion />
      <BannerCompletaFormulario />
      <FormularioInscripcion />
      <FaqInscripcion />
      <BannerFechasClave />
    </main>
  );
}

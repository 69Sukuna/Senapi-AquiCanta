import HeroInscripcion from './components/HeroInscripcion';
import BannerCompletaFormulario from './components/BannerCompletaFormulario';
import FormularioInscripcion from './components/FormularioInscripcion';
import FaqInscripcion from './components/FaqInscripcion';
import BannerFechasClave from './components/BannerFechasClave';

export default function InscripcionesPage() {
  return (
    <main className="container">
      <HeroInscripcion />
      <BannerCompletaFormulario />
      <FormularioInscripcion />
      <FaqInscripcion />
      <BannerFechasClave />
    </main>
  );
}

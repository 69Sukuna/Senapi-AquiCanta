import { ChevronDown } from 'lucide-react';

// Misma línea tricolor que separa las secciones de ancho completo (Hero,
// BannerCompletaFormulario, BannerFechasClave), pero como borde superior acá
// porque el FAQ va después del formulario, no antes de otra sección propia.
const gradientBorderStyle = {
  borderTop: '4px solid',
  borderImage: 'linear-gradient(to right, #e30613, #fcee21, #00873e) 1',
};

// Respuestas verificadas contra el texto real de "CONVOCATORIA AQUI CANTA
// BOLIVIA, 26 AGOSTO 2026.docx" (sección CONDICIONES y DE LOS POSTULANTES).
// El mockup usado de referencia para el diseño traía "Sí, no existen
// limitaciones..." en la primera pregunta, lo cual contradice la
// convocatoria ("Ningún concursante podrá postular o participar en más de
// una categoría") — se usa la respuesta real, no la del mockup.
const PREGUNTAS = [
  {
    pregunta: '¿Puedo participar en más de una categoría?',
    respuesta:
      'No. Ningún concursante puede postular o participar en más de una categoría — hacerlo puede significar la descalificación o eliminación inmediata del concurso.',
  },
  {
    pregunta: '¿Pueden participar artistas considerados profesionales?',
    respuesta:
      'No, salvo excepcionalmente en las categorías Composición y Especial. Se considera profesional a quien vive principalmente del arte y percibe ingresos por ello, tiene una trayectoria individual consolidada, o forma (o formó) parte de una agrupación con 3 años o más de trayectoria.',
  },
  {
    pregunta: '¿Quiénes no pueden participar en el festival?',
    respuesta:
      'Los miembros del comité organizador y sus familiares hasta el segundo grado de consanguinidad (padres, hijos, hermanos, abuelos y nietos). Las postulaciones que incumplan esto son descalificadas de oficio.',
  },
];

export default function FaqInscripcion() {
  return (
    <section className="container mb-16! pt-8!" style={gradientBorderStyle}>
      <h2 className="font-bakbak text-3xl! font-black text-black">Preguntas frecuentes</h2>

      <div className="mt-6! flex flex-col gap-4">
        {PREGUNTAS.map(({ pregunta, respuesta }, index) => (
          <details
            key={pregunta}
            open={index === 0}
            className="group rounded-3xl border border-(--brand-cafe)/20 bg-white px-6! py-5! [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="font-barlow text-lg font-semibold text-black">{pregunta}</span>
              <ChevronDown
                size={20}
                className="shrink-0 text-(--brand-cafe) transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="font-barlow mt-3! text-sm leading-relaxed text-(--brand-cafe)">{respuesta}</p>
          </details>
        ))}
      </div>
      <div className="mt-10! flex justify-center">
        {/* SVG local — se usa <img> normal en vez de next/image porque el
            optimizador de Next rechaza .svg salvo que se habilite
            dangerouslyAllowSVG en next.config.mjs (no está activado acá).
            El SVG trae fill blanco fijo; brightness-0 lo pasa a negro y la
            opacidad baja lo deja como marca de agua gris tenue sobre el
            fondo claro, en vez de blanco invisible. */}
        <img
          src="/images/LOGOS/LOGO ACB BLANCO.svg"
          alt="Aquí Canta Bolivia"
          className="h-auto w-56 brightness-0 opacity-15"
        />
      </div>
    </section>
  );
}

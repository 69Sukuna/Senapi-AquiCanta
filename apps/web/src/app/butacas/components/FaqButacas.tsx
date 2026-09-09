import { ChevronDown } from 'lucide-react';

const gradientBorderStyle = {
  borderTop: '4px solid',
  borderImage: 'linear-gradient(to right, #e30613, #fcee21, #00873e) 1',
};

const PREGUNTAS = [
  {
    pregunta: '¿Qué ocurrirá si no voy al festival y poseo una reserva?',
    respuesta: 'Los asientos no ocupados hasta las 18:00 hrs. posteriormente serán dispuestos al público visitante.',
  },
  {
    pregunta: '¿Por qué solo puedo reservar 10 asientos?',
    respuesta: 'Es el máximo por reserva para que la mayor cantidad de personas pueda acceder a un lugar. Si necesitás más, podés hacer varias reservas con distintos datos de contacto.',
  },
  {
    pregunta: '¿Cómo puedo ver qué asientos tengo reservados?',
    respuesta: 'En la pestaña "Mis asientos" de esta misma página podés ver el detalle de todas tus reservas, con la fecha y los asientos elegidos.',
  },
];

export default function FaqButacas() {
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
    </section>
  );
}

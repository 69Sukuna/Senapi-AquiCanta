import { CalendarDays, MapPin, Phone } from 'lucide-react';
import { CRONOGRAMA_PRESELECCIONES, type PreseleccionDepartamental } from '@/lib/cronogramaPreselecciones';
import { getDepartamentoInfo } from '@/lib/departamentos';

// Se regenera cada hora para que las etiquetas "Finalizada / En curso /
// Próxima" se mantengan al día sin necesidad de un nuevo deploy.
export const revalidate = 3600;

type EstadoPreseleccion = 'finalizada' | 'en-curso' | 'proxima' | 'pendiente';

// Fecha de hoy en Bolivia (UTC-4), en el mismo formato YYYY-MM-DD que `dias`.
function hoyEnBolivia() {
  return new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function calcularEstados(hoy: string): EstadoPreseleccion[] {
  const estados = CRONOGRAMA_PRESELECCIONES.map(({ dias }): EstadoPreseleccion => {
    if (hoy > dias[dias.length - 1]) return 'finalizada';
    if (hoy >= dias[0]) return 'en-curso';
    return 'pendiente';
  });
  // Solo la primera pendiente se marca como "Próxima" (si ninguna está en curso).
  if (!estados.includes('en-curso')) {
    const siguiente = estados.indexOf('pendiente');
    if (siguiente !== -1) estados[siguiente] = 'proxima';
  }
  return estados;
}

const ETIQUETAS: Partial<Record<EstadoPreseleccion, { texto: string; clases: string }>> = {
  finalizada: { texto: 'Finalizada', clases: 'bg-black/5 text-(--text-muted)' },
  'en-curso': { texto: 'En curso', clases: 'bg-[#2e7d46] text-white' },
  proxima: { texto: 'Próxima', clases: 'bg-[#e08f1f] text-white' },
};

function TarjetaPreseleccion({
  preseleccion,
  estado,
}: {
  preseleccion: PreseleccionDepartamental;
  estado: EstadoPreseleccion;
}) {
  const info = getDepartamentoInfo(preseleccion.departamento);
  const etiqueta = ETIQUETAS[estado];

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card) shadow-xl shadow-black/5 transition-opacity duration-200 ${
        estado === 'finalizada' ? 'opacity-60' : ''
      }`}
    >
      <div className="h-1.5! w-full shrink-0" style={{ backgroundColor: info?.color }} />

      <div className="flex flex-1 flex-col gap-4! p-6!">
        <div className="flex items-start justify-between gap-3!">
          <h2 className="font-bakbak text-3xl leading-none text-(--brand-negro)">{info?.label}</h2>
          {etiqueta && (
            <span className={`shrink-0 rounded-full px-3! py-1! text-xs font-bold ${etiqueta.clases}`}>
              {etiqueta.texto}
            </span>
          )}
        </div>

        <dl className="font-barlow flex flex-col gap-3! text-sm">
          <div className="flex items-start gap-3!">
            <CalendarDays size={18} className="mt-0.5! shrink-0 text-(--brand-cafe)" aria-hidden="true" />
            <div>
              <dt className="sr-only">Fecha</dt>
              <dd className="text-base font-bold text-(--text-primary)">{preseleccion.fechaTexto}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3!">
            <MapPin size={18} className="mt-0.5! shrink-0 text-(--brand-cafe)" aria-hidden="true" />
            <div>
              <dt className="sr-only">Lugar</dt>
              <dd className="font-medium text-(--text-secondary)">{preseleccion.lugar}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3!">
            <Phone size={18} className="mt-0.5! shrink-0 text-(--brand-cafe)" aria-hidden="true" />
            <div>
              <dt className="sr-only">Contacto del responsable</dt>
              <dd>
                <a
                  href={`tel:+591${preseleccion.contacto}`}
                  className="font-semibold text-[#1e63b8]! underline-offset-2 hover:underline"
                >
                  {preseleccion.contacto}
                </a>
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default function CronogramaPage() {
  const estados = calcularEstados(hoyEnBolivia());

  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg-primary)">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#f0a83e] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#1e63b8] opacity-[0.1] blur-3xl" />

      <div className="relative mx-auto! max-w-7xl px-6! py-16! sm:px-10! lg:py-20!">
        <p className="font-barlow text-xs font-semibold tracking-[0.25em] text-(--brand-cafe) uppercase sm:text-sm">
          Preselecciones presenciales departamentales
        </p>

        <h1 className="font-bakbak mt-2! text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] text-(--brand-negro)">
          Cronograma
        </h1>
        <p className="font-barlow mt-4! max-w-2xl text-base font-medium text-(--brand-cafe) sm:text-lg">
          Fechas, lugares y contacto del responsable de la preselección en cada departamento.
        </p>

        <div className="mt-12! grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CRONOGRAMA_PRESELECCIONES.map((preseleccion, i) => (
            <TarjetaPreseleccion key={preseleccion.departamento} preseleccion={preseleccion} estado={estados[i]} />
          ))}
        </div>
      </div>
    </main>
  );
}

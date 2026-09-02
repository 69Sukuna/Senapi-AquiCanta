import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface TarjetaCategoriaProps {
  categoria: string;
  cantidadOpciones: number;
  votada: boolean;
  onSeleccionar: () => void;
}

// Tarjeta de categoría de votación. Clickearla entra al detalle de esa
// categoría, donde se listan sus participantes para votar.
export function TarjetaCategoria({ categoria, cantidadOpciones, votada, onSeleccionar }: TarjetaCategoriaProps) {
  return (
    <button
      type="button"
      onClick={onSeleccionar}
      className={`vt-card group flex h-full flex-col gap-4 p-6 text-left transition-all duration-300 ${
        votada ? 'vt-card-lider' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="vt-eyebrow">Categoría</span>
        {votada && (
          <span className="vt-badge inline-flex items-center gap-1.5">
            <CheckCircle2 size={12} aria-hidden="true" /> Voto emitido
          </span>
        )}
      </div>

      <h3 className="text-lg leading-snug font-extrabold text-[var(--vt-text-primary)]">{categoria}</h3>

      <p className="text-sm text-[var(--vt-text-muted)]">
        {cantidadOpciones} {cantidadOpciones === 1 ? 'participante' : 'participantes'}
      </p>

      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--vt-mustard-deep)]">
        {votada ? 'Ver mi voto' : 'Entrar a la categoría'}
        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </button>
  );
}

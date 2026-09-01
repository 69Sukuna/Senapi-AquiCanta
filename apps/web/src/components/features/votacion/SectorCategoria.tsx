import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface SectorCategoriaProps {
  categoria: string;
  cantidadOpciones: number;
  votada: boolean;
  onSeleccionar: () => void;
}

// Tarjeta de "sector": cada categoría de votación se presenta como un sector
// del teatro (igual que en /butacas, donde primero se elige un sector y
// después sus butacas). Clickearla entra al detalle de esa categoría.
export function SectorCategoria({ categoria, cantidadOpciones, votada, onSeleccionar }: SectorCategoriaProps) {
  return (
    <button
      type="button"
      onClick={onSeleccionar}
      className={`vt-card group flex h-full flex-col gap-4 p-6 text-left transition-all duration-300 ${
        votada ? 'vt-card-lider' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="vt-eyebrow">Sector</span>
        {votada && (
          <span className="vt-badge inline-flex items-center gap-1.5">
            <CheckCircle2 size={12} aria-hidden="true" /> Voto emitido
          </span>
        )}
      </div>

      <h3 className="text-lg leading-snug font-extrabold text-[var(--vt-text-primary)]">{categoria}</h3>

      <p className="text-sm text-[var(--vt-text-muted)]">
        {cantidadOpciones} {cantidadOpciones === 1 ? 'butaca disponible' : 'butacas disponibles'}
      </p>

      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--vt-mustard-light)]">
        {votada ? 'Ver mi butaca' : 'Entrar al sector'}
        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </button>
  );
}

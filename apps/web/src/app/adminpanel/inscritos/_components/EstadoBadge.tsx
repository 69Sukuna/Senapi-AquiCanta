import { ESTADOS_INSCRIPCION, type EstadoInscripcion } from '@/lib/estadoInscripcion';

export function EstadoBadge({ estado }: { estado: EstadoInscripcion }) {
  const info = ESTADOS_INSCRIPCION[estado];

  return (
    <span
      className="inline-flex! items-center gap-1.5 rounded-full border px-3! py-1! text-xs font-bold whitespace-nowrap"
      style={{ borderColor: `${info.color}66`, backgroundColor: `${info.color}1a`, color: info.color }}
    >
      <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: info.color }} />
      {info.label}
    </span>
  );
}

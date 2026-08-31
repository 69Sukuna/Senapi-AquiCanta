import { getDepartamentoInfo } from '@/lib/departamentos';

interface DepartamentoBadgeProps {
  departamento: string | null | undefined;
  className?: string;
}

// No es la bandera oficial del departamento (ver lib/departamentos.ts) — es
// un color distintivo por región para diferenciar de un vistazo.
export function DepartamentoBadge({ departamento, className }: DepartamentoBadgeProps) {
  const info = getDepartamentoInfo(departamento);
  if (!info) return null;

  return (
    <span
      className={`inline-flex! items-center gap-1.5 rounded-full border px-3! py-1! text-xs font-bold ${className ?? ''}`}
      style={{ borderColor: `${info.color}66`, backgroundColor: `${info.color}1a`, color: info.color }}
    >
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: info.color }}
      />
      {info.label}
    </span>
  );
}

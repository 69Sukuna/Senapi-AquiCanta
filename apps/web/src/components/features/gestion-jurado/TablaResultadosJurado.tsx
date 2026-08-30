import { Trophy } from 'lucide-react';
import { PUNTAJE_MAXIMO_TOTAL } from '@/mocks';
import type { ResultadoConsolidadoJurado } from '@/types';

interface TablaResultadosJuradoProps {
  resultados: ResultadoConsolidadoJurado[];
}

export function TablaResultadosJurado({ resultados }: TablaResultadosJuradoProps) {
  return (
    <div className="vt-card overflow-x-auto p-6">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--vt-border)' }}>
            <th className="pb-3 pr-4 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--vt-text-muted)]">
              Puesto
            </th>
            <th className="pb-3 pr-4 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--vt-text-muted)]">
              Participante
            </th>
            <th className="pb-3 pr-4 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--vt-text-muted)]">
              Categoría
            </th>
            <th className="pb-3 pr-4 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--vt-text-muted)]">
              Jueces
            </th>
            <th className="pb-3 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--vt-text-muted)]">
              Promedio
            </th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((resultado) => (
            <tr key={resultado.participanteId} style={{ borderBottom: '1px solid var(--vt-border)' }}>
              <td className="py-3 pr-4 font-bold text-[var(--vt-mustard-light)]">
                <span className="inline-flex items-center gap-1">
                  {resultado.puesto !== null && resultado.puesto <= 3 && <Trophy size={14} aria-hidden="true" />}
                  {resultado.puesto ?? '—'}
                </span>
              </td>
              <td className="py-3 pr-4 text-[var(--vt-text-primary)]">{resultado.nombreArtistico}</td>
              <td className="py-3 pr-4 text-[var(--vt-text-secondary)]">{resultado.categoria}</td>
              <td className="py-3 pr-4 tabular-nums text-[var(--vt-text-secondary)]">
                {resultado.juecesQueCalificaron}/{resultado.totalJueces}
              </td>
              <td className="py-3">
                {resultado.promedio !== null ? (
                  <span className="font-bold tabular-nums text-[var(--vt-text-primary)]">
                    {resultado.promedio.toFixed(1)}
                    <span className="text-xs font-normal text-[var(--vt-text-muted)]">/{PUNTAJE_MAXIMO_TOTAL}</span>
                  </span>
                ) : (
                  <span className="text-[var(--vt-text-muted)]">Sin evaluar</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

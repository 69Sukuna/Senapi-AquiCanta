import { Trophy } from 'lucide-react';
import { PUNTAJE_MAXIMO_TOTAL } from '@/mocks';
import type { ResultadoConsolidadoJurado } from '@/types';

interface TablaResultadosJuradoProps {
  resultados: ResultadoConsolidadoJurado[];
}

export function TablaResultadosJurado({ resultados }: TablaResultadosJuradoProps) {
  return (
    <div className="min-h-[280px] overflow-x-auto rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-black/10">
            <th className="font-barlow pb-4 pr-4 text-[0.65rem] font-bold tracking-wider text-(--brand-cafe) uppercase">
              Puesto
            </th>
            <th className="font-barlow pb-4 pr-4 text-[0.65rem] font-bold tracking-wider text-(--brand-cafe) uppercase">
              Participante
            </th>
            <th className="font-barlow pb-4 pr-4 text-[0.65rem] font-bold tracking-wider text-(--brand-cafe) uppercase">
              Categoría
            </th>
            <th className="font-barlow pb-4 pr-4 text-[0.65rem] font-bold tracking-wider text-(--brand-cafe) uppercase">
              Jueces
            </th>
            <th className="font-barlow pb-4 text-[0.65rem] font-bold tracking-wider text-(--brand-cafe) uppercase">
              Promedio
            </th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((resultado) => (
            <tr key={resultado.participanteId} className="border-b border-black/10">
              <td className="font-barlow py-4 pr-4 font-bold text-(--brand-cafe)">
                <span className="inline-flex items-center gap-1">
                  {resultado.puesto !== null && resultado.puesto <= 3 && <Trophy size={14} aria-hidden="true" />}
                  {resultado.puesto ?? '—'}
                </span>
              </td>
              <td className="font-barlow py-4 pr-4 text-(--brand-negro)">{resultado.nombreArtistico}</td>
              <td className="font-barlow py-4 pr-4 text-(--brand-cafe)">{resultado.categoria}</td>
              <td className="font-barlow py-4 pr-4 tabular-nums text-(--brand-cafe)">
                {resultado.juecesQueCalificaron}/{resultado.totalJueces}
              </td>
              <td className="font-barlow py-4">
                {resultado.promedio !== null ? (
                  <span className="font-bold tabular-nums text-(--brand-negro)">
                    {resultado.promedio.toFixed(1)}
                    <span className="text-xs font-normal text-(--brand-cafe)">/{PUNTAJE_MAXIMO_TOTAL}</span>
                  </span>
                ) : (
                  <span className="text-(--brand-cafe)/60">Sin evaluar</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

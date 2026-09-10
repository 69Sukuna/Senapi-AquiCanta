'use client';

import Image from 'next/image';
import type { JuezPerfil } from '@/types';

const gradientTricolor = 'linear-gradient(to right, #e30613, #fcee21, #00873e)';

interface SelectorJuezProps {
  jueces: JuezPerfil[];
  juezActivoId: string;
  onSeleccionar: (juezId: string) => void;
  progreso: (juezId: string) => number;
  totalParticipantes: number;
}

export function SelectorJuez({ jueces, juezActivoId, onSeleccionar, progreso, totalParticipantes }: SelectorJuezProps) {
  const juezActivo = jueces.find((juez) => juez.id === juezActivoId) ?? jueces[0];
  if (!juezActivo) return null;

  const completados = progreso(juezActivo.id);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md">
          <Image src={juezActivo.fotoUrl} alt={juezActivo.nombre} fill sizes="96px" className="object-cover" />
        </div>
        <div>
          <h2 className="font-bakbak text-2xl font-black text-(--brand-negro)">{juezActivo.nombre}</h2>
          {juezActivo.esPortavoz && (
            <span className="font-barlow block text-sm font-bold tracking-[0.15em] text-(--brand-cafe) uppercase">
              Portavoz
            </span>
          )}
          <p className="font-barlow mt-1 text-base text-(--brand-cafe)">{juezActivo.especialidad}</p>

          <div className="mt-3 flex max-w-xs items-center gap-3">
            <span className="font-barlow shrink-0 text-xs font-semibold tracking-wide text-(--brand-cafe) uppercase">
              Participantes calificados
            </span>
            <div className="h-2 w-32 shrink-0 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${(completados / totalParticipantes) * 100}%`, background: gradientTricolor }}
              />
            </div>
            <span className="font-barlow shrink-0 text-sm font-bold tabular-nums text-(--brand-negro)">
              {completados}/{totalParticipantes}
            </span>
          </div>
        </div>
      </div>

      {jueces.length > 1 && (
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Cambiar jurado">
          {jueces.map((juez) => {
            const activo = juez.id === juezActivoId;
            return (
              <button
                key={juez.id}
                type="button"
                role="radio"
                aria-checked={activo}
                aria-label={juez.nombre}
                title={juez.nombre}
                onClick={() => onSeleccionar(juez.id)}
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full transition-opacity"
                style={{
                  boxShadow: activo ? '0 0 0 2px var(--brand-cafe)' : '0 0 0 1px rgba(0,0,0,0.15)',
                  opacity: activo ? 1 : 0.55,
                }}
              >
                <Image src={juez.fotoUrl} alt={juez.nombre} fill sizes="40px" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

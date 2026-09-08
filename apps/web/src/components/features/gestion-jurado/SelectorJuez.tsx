'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import type { JuezPerfil } from '@/types';

interface SelectorJuezProps {
  jueces: JuezPerfil[];
  juezActivoId: string;
  onSeleccionar: (juezId: string) => void;
  progreso: (juezId: string) => number;
  totalParticipantes: number;
}

export function SelectorJuez({ jueces, juezActivoId, onSeleccionar, progreso, totalParticipantes }: SelectorJuezProps) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-5" role="radiogroup" aria-label="Seleccionar jurado activo">
      {jueces.map((juez) => {
        const completados = progreso(juez.id);
        const activo = juez.id === juezActivoId;

        return (
          <button
            key={juez.id}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onSeleccionar(juez.id)}
            className="vt-card flex flex-col items-center gap-2.5 px-4 py-6 text-center transition-colors"
            style={
              activo
                ? { borderColor: 'var(--vt-border-active)', background: 'var(--bg-card-hover)' }
                : undefined
            }
          >
            <div
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full"
              style={{
                background: 'var(--vt-gradient-brand)',
                boxShadow: activo ? '0 0 0 3px var(--vt-border-active)' : '0 0 0 2px var(--vt-border)',
              }}
            >
              <Image src={juez.fotoUrl} alt={juez.nombre} fill sizes="64px" className="object-cover" />
              {juez.esPortavoz && (
                <span
                  className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ background: 'var(--vt-mustard-deep)' }}
                  title="Portavoz del jurado"
                >
                  <Star size={11} className="fill-current text-white" aria-hidden="true" />
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-[var(--vt-text-primary)]">{juez.nombre}</span>
            {juez.esPortavoz && <span className="vt-badge text-[0.6rem]">Portavoz</span>}
            <p className="text-xs leading-snug text-[var(--vt-text-secondary)]">{juez.especialidad}</p>
            <div className="mt-1.5 flex w-full items-center gap-2">
              <div className="vt-progress-track h-1.5 flex-1 overflow-hidden rounded-full">
                <div
                  className="vt-progress-fill h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${(completados / totalParticipantes) * 100}%` }}
                />
              </div>
              <span className="text-[0.65rem] font-semibold tabular-nums text-[var(--vt-text-muted)]">
                {completados}/{totalParticipantes}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

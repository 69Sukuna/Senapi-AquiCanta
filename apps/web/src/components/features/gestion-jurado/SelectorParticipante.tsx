'use client';

import { Check } from 'lucide-react';
import type { ParticipanteCalificacion } from '@/types';

function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase())
    .join('');
}

interface SelectorParticipanteProps {
  participantes: ParticipanteCalificacion[];
  participanteActivoId: string | null;
  onSeleccionar: (participanteId: string) => void;
  estaEmitido: (participanteId: string) => boolean;
}

export function SelectorParticipante({
  participantes,
  participanteActivoId,
  onSeleccionar,
  estaEmitido,
}: SelectorParticipanteProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      role="radiogroup"
      aria-label="Elegir participante a calificar"
    >
      {participantes.map((participante) => {
        const activo = participante.id === participanteActivoId;
        const emitido = estaEmitido(participante.id);

        return (
          <button
            key={participante.id}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onSeleccionar(participante.id)}
            className="vt-card flex flex-col items-center gap-2 px-4 py-5 text-center"
            style={
              activo ? { borderColor: 'var(--vt-border-active)', background: 'rgba(224, 165, 39, 0.1)' } : undefined
            }
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
              style={{ background: 'var(--vt-gradient-brand)', color: '#200308' }}
              aria-hidden="true"
            >
              {iniciales(participante.nombreArtistico)}
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--vt-text-primary)]">{participante.nombreArtistico}</p>
              <p className="mt-0.5 text-[0.65rem] text-[var(--vt-text-muted)]">{participante.departamento}</p>
            </div>
            {emitido && (
              <span className="flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wide text-[var(--vt-mustard-light)]">
                <Check size={11} aria-hidden="true" /> Calificado
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import type { ParticipanteCalificacion } from '@/types';

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
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
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
            className="vt-card flex flex-col items-center gap-3 px-4 py-6 text-center"
            style={
              activo ? { borderColor: 'var(--vt-border-active)', background: 'rgba(224, 143, 31, 0.12)' } : undefined
            }
          >
            <div
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full"
              style={{ background: 'var(--vt-gradient-brand)' }}
            >
              <Image
                src={participante.imagen}
                alt={participante.nombreArtistico}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs leading-snug font-bold text-[var(--vt-text-primary)]">
                {participante.nombreArtistico}
              </p>
              <p className="text-[0.65rem] leading-snug text-[var(--vt-text-muted)]">{participante.departamento}</p>
            </div>
            {emitido && (
              <span className="flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wide text-[var(--vt-mustard-deep)]">
                <Check size={11} aria-hidden="true" /> Calificado
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

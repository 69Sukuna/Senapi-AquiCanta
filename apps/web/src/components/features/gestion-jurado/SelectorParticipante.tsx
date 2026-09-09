'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import type { ParticipanteCalificacion } from '@/types';

const gradientTricolor = 'linear-gradient(135deg, #e30613, #fcee21, #00873e)';

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
            className={`flex flex-col items-center gap-3 rounded-2xl border px-4 py-6 text-center shadow-sm transition-colors ${
              activo
                ? 'border-(--brand-cafe) bg-(--brand-cafe) text-white'
                : 'border-black/10 bg-white text-(--brand-negro) hover:border-(--brand-cafe)/40'
            }`}
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full p-[2px]" style={{ background: gradientTricolor }}>
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={participante.imagen}
                  alt={participante.nombreArtistico}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-barlow text-sm leading-snug font-bold">{participante.nombreArtistico}</p>
              <p className={`font-barlow text-xs leading-snug ${activo ? 'text-white/70' : 'text-(--brand-cafe)/60'}`}>
                {participante.departamento}
              </p>
            </div>
            {emitido && (
              <span
                className={`flex items-center gap-1 text-[0.6rem] font-bold tracking-wide uppercase ${
                  activo ? 'text-white' : 'text-(--brand-verde)'
                }`}
              >
                <Check size={11} aria-hidden="true" /> Calificado
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

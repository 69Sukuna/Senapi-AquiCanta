'use client';

import { Sparkles, Users, Vote } from 'lucide-react';
import { TarjetaParticipanteVotacion } from '@/components/features/votacion';
import { useNumberTicker, useVotacionSesion } from '@/hooks';
import { CONTEO_INICIAL_VOTACION_VIVO, PARTICIPANTES_CALIFICACION } from '@/mocks';

export default function VotacionVivoPage() {
  const { conteoVotos, participanteVotadoId, yaVoto, listo, votar } = useVotacionSesion({
    storageKey: 'votacion-vivo',
    conteoInicial: CONTEO_INICIAL_VOTACION_VIVO,
  });

  const totalVotos = Object.values(conteoVotos).reduce((acumulado, votos) => acumulado + votos, 0);
  const totalVotosAnimado = useNumberTicker(totalVotos);
  const maxVotos = Math.max(...PARTICIPANTES_CALIFICACION.map((p) => conteoVotos[p.id] ?? 0), 1);

  return (
    <main className="tema-votacion">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4 text-xs" style={{ borderColor: 'var(--vt-border)' }}>
          <div className="flex items-center gap-2 font-extrabold tracking-wide text-[var(--vt-text-primary)]">
            <span className="text-[var(--vt-text-muted)]">Festival Nacional</span>
            <span>Aquí canta Bolivia</span>
          </div>
          <span className="uppercase tracking-widest text-[var(--vt-text-muted)]">Edición 2026</span>
        </div>

        <header className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="vt-eyebrow">La gran final, minuto a minuto</span>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
              El escenario está abierto,
              <br />
              <span style={{ color: 'var(--vt-mustard-light)' }}>tu voto decide.</span>
            </h1>
            <p className="mt-4 text-[var(--vt-text-secondary)]" aria-live="polite" aria-atomic="true">
              La transmisión está activa y los votos se actualizan al instante —{' '}
              <span className="font-semibold tabular-nums text-[var(--vt-text-primary)]">
                {Math.round(totalVotosAnimado).toLocaleString('es-BO')}
              </span>{' '}
              votos emitidos hasta ahora.
            </p>
            <span className="vt-badge vt-badge-live mt-5 inline-flex">
              <span className="vt-pulse-dot" /> En vivo
            </span>
            {yaVoto && (
              <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--vt-mustard-light)' }} role="status">
                Ya registraste tu voto en esta sesión. ¡Gracias por participar!
              </p>
            )}
          </div>

          <div
            className="vt-card flex min-w-[300px] flex-col items-center gap-2 px-10 py-8 text-center"
            style={{ borderColor: 'var(--vt-border)' }}
          >
            <span className="vt-eyebrow flex items-center gap-2">
              <Vote size={16} aria-hidden="true" /> Votos registrados
            </span>
            <p className="text-6xl font-extrabold leading-none tabular-nums" style={{ color: 'var(--vt-mustard-light)' }}>
              {Math.round(totalVotosAnimado).toLocaleString('es-BO')}
            </p>
            <p className="text-sm text-[var(--vt-text-muted)]">Actualización en tiempo real</p>
          </div>
        </header>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="vt-eyebrow flex items-center gap-2">
              <Sparkles size={12} aria-hidden="true" /> Participantes
            </span>
            <h2 className="mt-2 text-2xl font-extrabold">Vota por tu favorito</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--vt-text-muted)]">
            <Users size={14} aria-hidden="true" /> Un voto por persona · Comparte tu voz
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PARTICIPANTES_CALIFICACION.map((participante, indice) => {
            const votos = conteoVotos[participante.id] ?? 0;
            const porcentaje = totalVotos > 0 ? (votos / totalVotos) * 100 : 0;

            return (
              <TarjetaParticipanteVotacion
                key={participante.id}
                participante={participante}
                numero={indice + 1}
                votos={votos}
                porcentaje={porcentaje}
                seleccionado={participanteVotadoId === participante.id}
                deshabilitado={!listo || yaVoto}
                onVotar={() => votar(participante.id)}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

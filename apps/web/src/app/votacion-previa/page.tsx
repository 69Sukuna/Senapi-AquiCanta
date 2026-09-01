'use client';

import { Sparkles, Users, Vote } from 'lucide-react';
import { TarjetaParticipanteVotacion } from '@/components/features/votacion';
import { useNumberTicker, useVotacionSesion } from '@/hooks';
import { CONTEO_INICIAL_VOTACION_PREVIA, PARTICIPANTES_CALIFICACION } from '@/mocks';

export default function VotacionPreviaPage() {
  const { conteoVotos, participanteVotadoId, yaVoto, listo, votar } = useVotacionSesion({
    storageKey: 'votacion-previa',
    conteoInicial: CONTEO_INICIAL_VOTACION_PREVIA,
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
            <span className="vt-eyebrow">La voz de nuestras raíces</span>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
              Elige la canción
              <br />
              <span style={{ color: 'var(--vt-mustard-light)' }}>que nos une.</span>
            </h1>
            <p className="mt-4 text-[var(--vt-text-secondary)]">
              Ocho voces avanzan a la fase previa. Tu voto ayuda a decidir quiénes llegarán a la gran final del festival.
            </p>
            <span className="vt-badge mt-5 inline-flex">Fase de votación previa</span>
            {yaVoto && (
              <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--vt-mustard-light)' }} role="status">
                Ya registraste tu voto en esta sesión. ¡Gracias por participar!
              </p>
            )}
          </div>

          <div
            className="vt-card flex w-full flex-col items-center gap-2 px-10 py-8 text-right sm:min-w-[300px] sm:w-auto"
            style={{ borderColor: 'var(--vt-border)' }}
          >
            <span className="vt-eyebrow flex items-center gap-2">
              <Vote size={14} aria-hidden="true" /> Votos registrados
            </span>
            <p className="text-6xl font-extrabold leading-none tabular-nums" style={{ color: 'var(--vt-mustard-light)' }}>
              {Math.round(totalVotosAnimado).toLocaleString('es-BO')}
            </p>
            <p className="text-sm text-[var(--vt-text-muted)]">Votación abierta hasta la próxima ronda</p>
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

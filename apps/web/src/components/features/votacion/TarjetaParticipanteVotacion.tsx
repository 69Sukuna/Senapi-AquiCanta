'use client';

import { CheckCircle2, Star } from 'lucide-react';
import { useNumberTicker } from '@/hooks';
import type { ParticipanteCalificacion } from '@/types';
import { AvatarParticipante } from './AvatarParticipante';

function formatearDuracion(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${String(resto).padStart(2, '0')}`;
}

interface ParametroEvaluacionItemProps {
  etiqueta: string;
  puntaje: number;
}

function ParametroEvaluacionItem({ etiqueta, puntaje }: ParametroEvaluacionItemProps) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-[var(--vt-text-muted)]">{etiqueta}</dt>
      <dd className="font-semibold tabular-nums text-[var(--vt-text-primary)]">{puntaje}/100</dd>
    </div>
  );
}

interface TarjetaParticipanteVotacionProps {
  participante: ParticipanteCalificacion;
  numero: number;
  votos: number;
  porcentaje: number;
  seleccionado: boolean;
  deshabilitado: boolean;
  onVotar: () => void;
}

export function TarjetaParticipanteVotacion({
  participante,
  numero,
  votos,
  porcentaje,
  seleccionado,
  deshabilitado,
  onVotar,
}: TarjetaParticipanteVotacionProps) {
  const votosAnimados = useNumberTicker(votos);
  const porcentajeAnimado = useNumberTicker(porcentaje);
  const puedeVotar = !seleccionado && !deshabilitado;
  const tituloId = `participante-${participante.id}-nombre`;

  return (
    <article className={`vt-card flex h-full flex-col overflow-hidden`} aria-labelledby={tituloId}>
      <div className="relative">
        <AvatarParticipante
          nombre={participante.nombreArtistico}
          numero={numero}
          ritmo={participante.obra.ritmo}
          imagen={participante.imagen}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex min-h-[2.75rem] items-start justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--vt-text-muted)]">
            {participante.departamento}
          </span>
          <span className="vt-badge text-right">{participante.categoria}</span>
        </div>

        <div>
          <h3 id={tituloId} className="text-xl font-extrabold text-[var(--vt-text-primary)]">
            {participante.nombreArtistico}
          </h3>
          <p className="mt-1 text-sm text-[var(--vt-text-secondary)]">
            Tema: <span className="font-semibold text-[var(--vt-text-primary)]">&ldquo;{participante.obra.titulo}&rdquo;</span>
          </p>
          <p className="text-xs text-[var(--vt-text-muted)]">
            Ritmo: {participante.obra.ritmo} · Autoría: {participante.obra.autor} · Duración:{' '}
            {formatearDuracion(participante.obra.duracionSegundos)}
          </p>
        </div>

        <div>
          <h4 className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--vt-text-muted)]">
            Instrumentos ejecutados
          </h4>
          <ul className="flex flex-wrap gap-2" aria-label="Instrumentos ejecutados">
            {participante.instrumentos.map((instrumento) => (
              <li key={instrumento} className="vt-tag">
                {instrumento}
              </li>
            ))}
          </ul>
        </div>

        <dl
          className="grid grid-cols-2 gap-x-4 gap-y-2 border-y py-4 text-xs"
          style={{ borderColor: 'var(--vt-border)' }}
        >
          <ParametroEvaluacionItem etiqueta="Técnica vocal" puntaje={participante.parametros.tecnicaVocal} />
          <ParametroEvaluacionItem etiqueta="Dominio instrumental" puntaje={participante.parametros.dominioInstrumental} />
          <ParametroEvaluacionItem etiqueta="Indumentaria típica" puntaje={participante.parametros.indumentariaTipica} />
          <ParametroEvaluacionItem etiqueta="Dominio de escenario" puntaje={participante.parametros.dominioEscenario} />
        </dl>

        <div className="mt-auto flex flex-col gap-3">
          <div
            className="vt-resultados flex items-stretch justify-between gap-3 rounded-xl px-4 py-3"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--vt-text-muted)]">
                Votos recibidos
              </span>
              <span className="text-2xl font-extrabold leading-none tabular-nums text-[var(--vt-text-primary)]">
                {Math.round(votosAnimados).toLocaleString('es-BO')}
              </span>
            </div>
            <div className="w-px shrink-0 self-stretch" style={{ background: 'var(--vt-border)' }} aria-hidden="true" />
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--vt-text-muted)]">
                % del total
              </span>
              <span className="text-2xl font-extrabold leading-none tabular-nums text-[var(--vt-mustard-light)]">
                {porcentajeAnimado.toFixed(1)}%
              </span>
            </div>
          </div>

          <div
            className="vt-progress-track h-1.5 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={Math.round(porcentaje)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Porcentaje de votos para ${participante.nombreArtistico}`}
          >
            <div
              className="vt-progress-fill h-full rounded-full transition-[width] duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: `${Math.min(100, porcentajeAnimado)}%` }}
            />
          </div>

          <button
            type="button"
            onClick={onVotar}
            disabled={!puedeVotar}
            aria-pressed={seleccionado}
            className={`vt-btn-estrella flex items-center justify-center gap-3 rounded-xl px-5 py-4 transition-opacity disabled:cursor-not-allowed ${
              seleccionado ? 'vt-btn-voted' : deshabilitado ? 'vt-btn-disabled' : 'vt-btn-vote'
            }`}
          >
            {seleccionado ? (
              <>
                <CheckCircle2 size={22} aria-hidden="true" />
                <span className="text-base font-extrabold uppercase tracking-wide">Voto Registrado</span>
              </>
            ) : (
              <>
                <Star size={26} className="vt-btn-estrella-icono" strokeWidth={2.2} aria-hidden="true" />
                <span className="flex flex-col items-start leading-[1.05]">
                  <span className="text-base font-extrabold uppercase tracking-wide">Emitir</span>
                  <span className="text-base font-extrabold uppercase tracking-wide">Voto</span>
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

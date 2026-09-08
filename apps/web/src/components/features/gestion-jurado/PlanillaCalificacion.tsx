'use client';

import type { ChangeEvent } from 'react';
import Image from 'next/image';
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { PUNTAJE_MAXIMO_TOTAL } from '@/mocks';
import type { ClaveCriterioEvaluacion, CriterioEvaluacionDefinicion, ParticipanteCalificacion, PuntajesCriterios } from '@/types';

interface PlanillaCalificacionProps {
  participante: ParticipanteCalificacion;
  numero: number;
  totalParticipantes: number;
  criterios: CriterioEvaluacionDefinicion[];
  puntajes: PuntajesCriterios;
  total: number;
  criteriosRespondidos: number;
  criteriosCompletos: boolean;
  emitido: boolean;
  onCambiarCriterio: (clave: ClaveCriterioEvaluacion, valor: number) => void;
  onEmitir: () => void;
}

export function PlanillaCalificacion({
  participante,
  numero,
  totalParticipantes,
  criterios,
  puntajes,
  total,
  criteriosRespondidos,
  criteriosCompletos,
  emitido,
  onCambiarCriterio,
  onEmitir,
}: PlanillaCalificacionProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="vt-eyebrow">Planilla digital</span>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--vt-text-primary)]">Evaluación artística</h2>
            <p className="mt-1 text-sm text-[var(--vt-text-secondary)]">
              Califique al participante según los criterios establecidos.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--vt-text-muted)]">
              Participante
            </span>
            <span className="text-2xl font-extrabold tabular-nums text-[var(--vt-text-primary)]">
              {numero}
              <span className="text-sm font-semibold text-[var(--vt-text-muted)]"> / {totalParticipantes}</span>
            </span>
            <div className="h-1 w-24 overflow-hidden rounded-full" style={{ background: 'rgba(27,42,74,0.08)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(numero / totalParticipantes) * 100}%`, background: 'var(--vt-gradient-brand)' }}
              />
            </div>
          </div>
        </div>

        <div className="vt-card flex flex-col items-center gap-4 px-6 py-8 text-center">
          <div
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full"
            style={{ background: 'var(--vt-gradient-brand)' }}
          >
            <Image
              src={participante.imagen}
              alt={participante.nombreArtistico}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <span className="vt-eyebrow">En competencia</span>
          <h3 className="text-lg font-extrabold text-[var(--vt-text-primary)]">{participante.nombreArtistico}</h3>
          <p className="max-w-md text-xs leading-relaxed text-[var(--vt-text-secondary)]">
            Origen: <span className="text-[var(--vt-text-primary)]">{participante.departamento}</span> · Tema:{' '}
            <span className="text-[var(--vt-text-primary)]">&ldquo;{participante.obra.titulo}&rdquo;</span>
          </p>
          <span className="vt-badge mt-1 font-mono text-[0.6rem]">Categoría · {participante.categoria}</span>
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-lg font-extrabold text-[var(--vt-text-primary)]">Rúbrica de calificación</h3>
              <p className="text-xs text-[var(--vt-text-secondary)]">
                Baremo oficial de la categoría &ldquo;{participante.categoria}&rdquo;: asigne un puntaje dentro del rango de
                cada criterio.
              </p>
            </div>
            <span className="text-xs font-bold tabular-nums text-[var(--vt-mustard-deep)]">
              {criteriosRespondidos} de {criterios.length} respondidos
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {criterios.map((criterio, indice) => {
              const valor = puntajes[criterio.clave] ?? 0;
              const inputId = `${participante.id}-${criterio.clave}`;
              const porcentaje = Math.round((criterio.puntajeMaximo / PUNTAJE_MAXIMO_TOTAL) * 100);

              const manejarCambio = (evento: ChangeEvent<HTMLInputElement>) => {
                const valorIngresado = Number(evento.target.value);
                if (Number.isNaN(valorIngresado)) return;
                onCambiarCriterio(criterio.clave, valorIngresado);
              };

              return (
                <div key={criterio.clave} className="vt-card flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[0.65rem] font-bold text-[var(--vt-text-muted)]" aria-hidden="true">
                        C{indice + 1}
                      </span>
                      <div>
                        <label htmlFor={inputId} className="text-sm font-bold text-[var(--vt-text-primary)]">
                          {criterio.etiqueta}
                        </label>
                        <p className="mt-1.5 text-xs leading-relaxed text-[var(--vt-text-muted)]">
                          {criterio.descripcion}
                        </p>
                      </div>
                    </div>
                    <span className="vt-badge shrink-0 text-[0.6rem]">{porcentaje}%</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      id={inputId}
                      type="range"
                      min={0}
                      max={criterio.puntajeMaximo}
                      step={1}
                      value={valor}
                      disabled={emitido}
                      onChange={manejarCambio}
                      aria-label={`${criterio.etiqueta} para ${participante.nombreArtistico}`}
                      className="vt-range w-full disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <span className="w-16 shrink-0 text-right text-lg font-extrabold tabular-nums text-[var(--vt-text-primary)]">
                      {valor}
                      <span className="text-xs font-semibold text-[var(--vt-text-muted)]">/{criterio.puntajeMaximo}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="vt-card static lg:sticky lg:top-6 flex flex-col gap-5 p-6">
        <div className="text-center">
          <span className="vt-eyebrow">Puntaje final</span>
          <p className="mt-2 font-mono text-5xl font-extrabold tabular-nums text-[var(--vt-mustard-deep)]">
            {total.toFixed(1)}
            <span className="text-lg font-semibold text-[var(--vt-text-muted)]">/{PUNTAJE_MAXIMO_TOTAL}</span>
          </p>
          <p className="mt-1 text-xs text-[var(--vt-text-muted)]">
            {emitido
              ? 'Calificación emitida'
              : criteriosRespondidos === 0
                ? 'Comience a calificar'
                : 'Calificación en progreso'}
          </p>
        </div>

        <div className="flex items-center justify-between border-y py-3 text-xs" style={{ borderColor: 'var(--vt-border)' }}>
          <span className="font-semibold text-[var(--vt-text-muted)]">Criterios evaluados</span>
          <span className="font-bold tabular-nums text-[var(--vt-text-primary)]">
            {criteriosRespondidos}/{criterios.length}
          </span>
        </div>

        <div
          className="flex items-start gap-2 rounded-xl p-3 text-xs"
          style={{ background: 'rgba(224,143,31,0.1)', border: '1px solid var(--vt-border)' }}
        >
          <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--vt-mustard-deep)' }} aria-hidden="true" />
          <div>
            <p className="font-bold text-[var(--vt-text-primary)]">Su calificación es confidencial</p>
            <p className="mt-0.5 text-[var(--vt-text-muted)]">Una vez emitida, no podrá modificarse.</p>
          </div>
        </div>

        {emitido ? (
          <div
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold uppercase tracking-wide"
            style={{ background: 'rgba(224,143,31,0.14)', color: 'var(--vt-mustard-deep)', border: '1px solid var(--vt-border-active)' }}
          >
            <Lock size={16} aria-hidden="true" /> Calificación emitida
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onEmitir}
              disabled={!criteriosCompletos}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold uppercase tracking-wide transition-opacity disabled:cursor-not-allowed ${
                criteriosCompletos ? 'vt-btn-vote' : 'vt-btn-disabled'
              }`}
            >
              Confirmar y emitir voto <ArrowRight size={16} aria-hidden="true" />
            </button>
            <p className="text-center text-[0.65rem] text-[var(--vt-text-muted)]">
              Complete todos los criterios para habilitar la emisión.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

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
            <span className="font-barlow text-xs font-bold tracking-[0.2em] text-(--brand-cafe) uppercase">
              Planilla digital
            </span>
            <h2 className="font-bakbak mt-1 text-2xl font-black text-(--brand-negro)">Evaluación Artística</h2>
            <p className="font-barlow mt-1 text-sm text-(--brand-cafe)">
              Califique al participante según los criterios establecidos.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-barlow text-[0.65rem] font-bold tracking-wider text-(--brand-cafe) uppercase">
              Participante
            </span>
            <span className="font-barlow text-2xl font-extrabold tabular-nums text-(--brand-negro)">
              {numero}
              <span className="text-sm font-semibold text-(--brand-cafe)"> / {totalParticipantes}</span>
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-(--brand-cafe) px-6 py-8 text-center text-white shadow-sm">
          <div className="relative mx-auto h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/60">
            <Image
              src={participante.imagen}
              alt={participante.nombreArtistico}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <span className="font-barlow mt-3 block text-xs font-bold tracking-[0.2em] text-white/70 uppercase">
            En competencia
          </span>
          <h3 className="font-bakbak mt-1 text-lg font-black">{participante.nombreArtistico}</h3>
          <p className="font-barlow mt-2 max-w-md text-xs leading-relaxed text-white/80 mx-auto">
            Origen: <span className="font-semibold text-white">{participante.departamento}</span> · Tema:{' '}
            <span className="font-semibold text-white">&ldquo;{participante.obra.titulo}&rdquo;</span>
          </p>
          <span className="font-barlow mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-[0.6rem] font-bold tracking-wide text-white uppercase">
            Categoría · {participante.categoria}
          </span>
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="font-bakbak text-lg font-black text-(--brand-negro)">Rúbrica de calificación</h3>
              <p className="font-barlow text-xs text-(--brand-cafe)">
                Baremo oficial de la categoría &ldquo;{participante.categoria}&rdquo;: asigne un puntaje dentro del rango de
                cada criterio.
              </p>
            </div>
            <span className="font-barlow text-xs font-bold tabular-nums text-(--brand-cafe)">
              {criteriosRespondidos}/{criterios.length} respondidos
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
                <div key={criterio.clave} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="font-barlow mt-0.5 text-[0.65rem] font-bold text-(--brand-cafe)" aria-hidden="true">
                        C{indice + 1}
                      </span>
                      <div>
                        <label htmlFor={inputId} className="font-barlow text-sm font-bold text-(--brand-negro)">
                          {criterio.etiqueta}
                        </label>
                        <p className="font-barlow mt-1.5 text-xs leading-relaxed text-(--brand-cafe)/80">
                          {criterio.descripcion}
                        </p>
                      </div>
                    </div>
                    <span className="font-barlow shrink-0 rounded-full bg-(--brand-crema) px-2.5 py-1 text-[0.6rem] font-bold text-(--brand-cafe)">
                      {porcentaje}%
                    </span>
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
                      className="jurado-range w-full disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <span className="font-barlow w-16 shrink-0 text-right text-lg font-extrabold tabular-nums text-(--brand-negro)">
                      {valor}
                      <span className="text-xs font-semibold text-(--brand-cafe)">/{criterio.puntajeMaximo}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="static flex flex-col gap-5 rounded-2xl border border-black/10 bg-white p-6 shadow-sm lg:sticky lg:top-6">
        <div className="text-center">
          <span className="font-barlow text-xs font-bold tracking-[0.2em] text-(--brand-cafe) uppercase">
            Puntaje final
          </span>
          <p className="font-bakbak mt-2 text-5xl font-black tabular-nums text-(--brand-negro)">
            {total.toFixed(1)}
            <span className="font-barlow text-lg font-semibold text-(--brand-cafe)">/{PUNTAJE_MAXIMO_TOTAL}</span>
          </p>
          <p className="font-barlow mt-1 text-xs text-(--brand-cafe)">
            {emitido
              ? 'Calificación emitida'
              : criteriosRespondidos === 0
                ? 'Comience a calificar'
                : 'Calificación en progreso'}
          </p>
        </div>

        <div className="flex items-center justify-between border-y border-black/10 py-3 text-xs">
          <span className="font-barlow font-semibold text-(--brand-cafe)">Criterios evaluados</span>
          <span className="font-barlow font-bold tabular-nums text-(--brand-negro)">
            {criteriosRespondidos}/{criterios.length}
          </span>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-black/10 bg-(--brand-crema) p-3 text-xs">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-(--brand-cafe)" aria-hidden="true" />
          <div>
            <p className="font-barlow font-bold text-(--brand-negro)">Su calificación es confidencial</p>
            <p className="font-barlow mt-0.5 text-(--brand-cafe)">Una vez emitida, no podrá modificarse.</p>
          </div>
        </div>

        {emitido ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-(--brand-verde)/30 bg-(--brand-verde)/10 px-5 py-4 text-sm font-bold tracking-wide text-(--brand-verde) uppercase">
            <Lock size={16} aria-hidden="true" /> Calificación emitida
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onEmitir}
              disabled={!criteriosCompletos}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold tracking-wide uppercase transition-opacity disabled:cursor-not-allowed ${
                criteriosCompletos
                  ? 'bg-(--brand-negro) text-white hover:opacity-90'
                  : 'bg-black/10 text-(--brand-cafe)/60'
              }`}
            >
              Confirmar y emitir voto <ArrowRight size={16} aria-hidden="true" />
            </button>
            <p className="font-barlow text-center text-[0.65rem] text-(--brand-cafe)">
              Complete todos los criterios para habilitar la emisión.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

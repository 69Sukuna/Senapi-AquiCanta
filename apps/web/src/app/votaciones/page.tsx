'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, Radio, Sparkles, Vote } from 'lucide-react';
import { SectorCategoria, TarjetaParticipanteVotacion } from '@/components/features/votacion';
import { useNumberTicker, useVotacionSesion } from '@/hooks';
import { CONTEO_INICIAL_VOTACION_PREVIA, CONTEO_INICIAL_VOTACION_VIVO, PARTICIPANTES_CALIFICACION } from '@/mocks';

type Modalidad = 'previa' | 'vivo';

const MODALIDADES: { id: Modalidad; label: string }[] = [
  { id: 'previa', label: 'Fase previa' },
  { id: 'vivo', label: 'En vivo' },
];

export default function VotacionesPage() {
  const [modalidad, setModalidad] = useState<Modalidad>('previa');
  const [sectorActivo, setSectorActivo] = useState<string | null>(null);

  // Dos sesiones independientes (una por modalidad) para no mezclar los
  // conteos ni las restricciones de voto de la fase previa con las del vivo.
  const sesionPrevia = useVotacionSesion({
    storageKey: 'votacion-previa',
    conteoInicial: CONTEO_INICIAL_VOTACION_PREVIA,
  });
  const sesionVivo = useVotacionSesion({
    storageKey: 'votacion-vivo',
    conteoInicial: CONTEO_INICIAL_VOTACION_VIVO,
  });
  const sesion = modalidad === 'previa' ? sesionPrevia : sesionVivo;

  // Cada categoría es un "sector" del teatro: primero se elige el sector,
  // después se ven y votan sus butacas (mismo patrón de navegación que
  // TeatroSeatMap en /butacas).
  const sectores = useMemo(() => {
    const mapa = new Map<string, typeof PARTICIPANTES_CALIFICACION>();
    for (const participante of PARTICIPANTES_CALIFICACION) {
      const lista = mapa.get(participante.categoria) ?? [];
      lista.push(participante);
      mapa.set(participante.categoria, lista);
    }
    return [...mapa.entries()].map(([categoria, participantes]) => ({ categoria, participantes }));
  }, []);

  const totalVotos = Object.values(sesion.conteoVotos).reduce((acumulado, votos) => acumulado + votos, 0);
  const totalVotosAnimado = useNumberTicker(totalVotos);

  const cambiarModalidad = (nueva: Modalidad) => {
    setModalidad(nueva);
    setSectorActivo(null);
  };

  const sectorSeleccionado = sectores.find((s) => s.categoria === sectorActivo) ?? null;

  return (
    <main className="tema-votacion">
      <div className="container">
        <div
          className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4 text-xs"
          style={{ borderColor: 'var(--vt-border)' }}
        >
          <div className="flex items-center gap-2 font-extrabold tracking-wide text-[var(--vt-text-primary)]">
            <span className="text-[var(--vt-text-muted)]">Festival Nacional</span>
            <span>Aquí canta Bolivia</span>
          </div>
          <span className="uppercase tracking-widest text-[var(--vt-text-muted)]">Edición 2026</span>
        </div>

        <header className="mb-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="vt-eyebrow">
              {modalidad === 'previa' ? 'La voz de nuestras raíces' : 'La gran final, minuto a minuto'}
            </span>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
              {modalidad === 'previa' ? (
                <>
                  Elegí butaca por butaca
                  <br />
                  <span style={{ color: 'var(--vt-mustard-light)' }}>quién nos representa.</span>
                </>
              ) : (
                <>
                  El escenario está abierto,
                  <br />
                  <span style={{ color: 'var(--vt-mustard-light)' }}>tu voto decide.</span>
                </>
              )}
            </h1>
            <p className="mt-4 text-[var(--vt-text-secondary)]">
              Cada categoría es un sector del teatro: entrá, recorré sus butacas y emití un único voto por sector.
            </p>
            <span className={`vt-badge mt-5 inline-flex ${modalidad === 'vivo' ? 'vt-badge-live' : ''}`}>
              {modalidad === 'vivo' && <span className="vt-pulse-dot" />}
              {modalidad === 'previa' ? 'Fase de votación previa' : 'En vivo'}
            </span>
          </div>

          <div
            className="vt-card flex w-full flex-col items-center gap-2 px-10 py-8 text-center sm:min-w-[300px] sm:w-auto"
            style={{ borderColor: 'var(--vt-border)' }}
          >
            <span className="vt-eyebrow flex items-center gap-2">
              <Vote size={14} aria-hidden="true" /> Votos registrados
            </span>
            <p className="text-6xl font-extrabold leading-none tabular-nums" style={{ color: 'var(--vt-mustard-light)' }}>
              {Math.round(totalVotosAnimado).toLocaleString('es-BO')}
            </p>
            <p className="text-sm text-[var(--vt-text-muted)]">
              {modalidad === 'previa' ? 'Votación abierta hasta la próxima ronda' : 'Actualización en tiempo real'}
            </p>
          </div>
        </header>

        <div className="mb-8 flex flex-wrap gap-2">
          {MODALIDADES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => cambiarModalidad(id)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                modalidad === id
                  ? 'border-[var(--vt-border-active)] bg-[rgba(224,165,39,0.15)] text-[var(--vt-mustard-light)]'
                  : 'border-transparent text-[var(--vt-text-muted)] hover:bg-white/6 hover:text-[var(--vt-text-secondary)]'
              }`}
            >
              {id === 'vivo' ? <Radio size={15} aria-hidden="true" /> : <Vote size={15} aria-hidden="true" />}
              {label}
            </button>
          ))}
        </div>

        {sectorActivo === null ? (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="vt-eyebrow flex items-center gap-2">
                  <Sparkles size={12} aria-hidden="true" /> Sectores de votación
                </span>
                <h2 className="mt-2 text-2xl font-extrabold">Elegí un sector para votar</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--vt-text-muted)]">
                Un voto por categoría · No se puede cambiar una vez emitido
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sectores.map(({ categoria, participantes }) => (
                <SectorCategoria
                  key={categoria}
                  categoria={categoria}
                  cantidadOpciones={participantes.length}
                  votada={sesion.yaVotoEnCategoria(categoria)}
                  onSeleccionar={() => setSectorActivo(categoria)}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setSectorActivo(null)}
              className="mb-5 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold text-[var(--vt-mustard-light)] transition-colors"
              style={{ borderColor: 'var(--vt-border)' }}
            >
              <ChevronLeft size={16} aria-hidden="true" /> Volver a sectores
            </button>

            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="vt-eyebrow">Sector</span>
                <h2 className="mt-1 text-2xl font-extrabold">{sectorActivo}</h2>
              </div>
              {sesion.yaVotoEnCategoria(sectorActivo) && (
                <p className="text-sm font-semibold" style={{ color: 'var(--vt-mustard-light)' }} role="status">
                  Ya registraste tu voto en este sector. ¡Gracias por participar!
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sectorSeleccionado?.participantes.map((participante, indice) => {
                const votos = sesion.conteoVotos[participante.id] ?? 0;
                const porcentaje = totalVotos > 0 ? (votos / totalVotos) * 100 : 0;
                const votoDeLaCategoria = sesion.votosPorCategoria[participante.categoria];

                return (
                  <TarjetaParticipanteVotacion
                    key={participante.id}
                    participante={participante}
                    numero={indice + 1}
                    votos={votos}
                    porcentaje={porcentaje}
                    seleccionado={votoDeLaCategoria === participante.id}
                    deshabilitado={!sesion.listo || votoDeLaCategoria !== undefined}
                    onVotar={() => sesion.votar(participante.id, participante.categoria)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

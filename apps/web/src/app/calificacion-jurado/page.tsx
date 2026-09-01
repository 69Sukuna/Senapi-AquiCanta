'use client';

import { useMemo, useState } from 'react';
import {
  PlanillaCalificacion,
  SelectorCategoria,
  SelectorJuez,
  SelectorParticipante,
  TablaResultadosJurado,
} from '@/components/features/gestion-jurado';
import { useGestionJurado } from '@/hooks';
import { JURADO_TITULARES, PARTICIPANTES_CALIFICACION } from '@/mocks';
import type { CategoriaConcurso } from '@/types';

export default function CalificacionJuradoPage() {
  const {
    juezActivoId,
    seleccionarJuez,
    actualizarCriterio,
    emitirCalificacion,
    puntajesDe,
    totalParticipante,
    criteriosRespondidos,
    evaluacionCompleta,
    estaEmitido,
    progresoJuez,
    resultados,
  } = useGestionJurado(PARTICIPANTES_CALIFICACION, JURADO_TITULARES);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaConcurso | null>(null);
  const [participanteActivoId, setParticipanteActivoId] = useState<string | null>(null);

  const juezActivo = JURADO_TITULARES.find((juez) => juez.id === juezActivoId);

  const categorias = useMemo(
    () => Array.from(new Set(PARTICIPANTES_CALIFICACION.map((participante) => participante.categoria))),
    [],
  );

  const participantesDeCategoria = useMemo(
    () => PARTICIPANTES_CALIFICACION.filter((participante) => participante.categoria === categoriaSeleccionada),
    [categoriaSeleccionada],
  );

  const indiceParticipante = participantesDeCategoria.findIndex((p) => p.id === participanteActivoId);
  const participanteActivo = indiceParticipante >= 0 ? participantesDeCategoria[indiceParticipante] : null;

  const elegirCategoria = (categoria: CategoriaConcurso) => {
    setCategoriaSeleccionada(categoria);
    setParticipanteActivoId(null);
  };

  return (
    <main className="tema-votacion">
      <div className="container">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="vt-badge">Sesión de jurado</span>
            <h1 className="mt-4 text-3xl font-extrabold text-[var(--vt-text-primary)]">Gestión del Jurado Calificador</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-[var(--vt-text-secondary)]">
              Cada jurado califica a un participante a la vez, bajo los mismos criterios técnicos y en una escala
              de 1 a 100 puntos. Una vez emitido el voto, la calificación queda bloqueada.
            </p>
          </div>
          <span className="vt-badge">{juezActivo?.nombre ?? '—'}</span>
        </header>

        <section className="mb-10">
          <span className="vt-eyebrow">Jurado calificador</span>
          <div className="mt-4">
            <SelectorJuez
              jueces={JURADO_TITULARES}
              juezActivoId={juezActivoId}
              onSeleccionar={seleccionarJuez}
              progreso={progresoJuez}
              totalParticipantes={PARTICIPANTES_CALIFICACION.length}
            />
          </div>
        </section>

        <section className="mb-10">
          <span className="vt-eyebrow">1. Elegir categoría</span>
          <div className="mt-4">
            <SelectorCategoria
              categorias={categorias}
              categoriaActiva={categoriaSeleccionada}
              onSeleccionar={elegirCategoria}
              cantidadEnCategoria={(categoria) =>
                PARTICIPANTES_CALIFICACION.filter((participante) => participante.categoria === categoria).length
              }
            />
          </div>
        </section>

        <section className="mb-10">
          <span className="vt-eyebrow">2. Elegir participante a calificar</span>
          <div className="mt-4">
            {categoriaSeleccionada ? (
              <SelectorParticipante
                participantes={participantesDeCategoria}
                participanteActivoId={participanteActivoId}
                onSeleccionar={setParticipanteActivoId}
                estaEmitido={(participanteId) => estaEmitido(juezActivoId, participanteId)}
              />
            ) : (
              <p className="vt-card p-5 text-center text-sm text-[var(--vt-text-muted)]">
                Seleccione primero una categoría para ver a sus participantes.
              </p>
            )}
          </div>
        </section>

        {participanteActivo && (
          <section className="mb-10">
            <PlanillaCalificacion
              participante={participanteActivo}
              numero={indiceParticipante + 1}
              totalParticipantes={participantesDeCategoria.length}
              puntajes={puntajesDe(juezActivoId, participanteActivo.id)}
              total={totalParticipante(juezActivoId, participanteActivo.id)}
              criteriosRespondidos={criteriosRespondidos(juezActivoId, participanteActivo.id)}
              criteriosCompletos={evaluacionCompleta(juezActivoId, participanteActivo.id)}
              emitido={estaEmitido(juezActivoId, participanteActivo.id)}
              onCambiarCriterio={(clave, valor) => actualizarCriterio(participanteActivo.id, clave, valor)}
              onEmitir={() => emitirCalificacion(participanteActivo.id)}
            />
          </section>
        )}

        <section>
          <h2 className="mb-5 text-xl font-extrabold text-[var(--vt-text-primary)]">Resultados Consolidados</h2>
          <TablaResultadosJurado resultados={resultados} />
        </section>
      </div>
    </main>
  );
}

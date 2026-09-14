'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  PlanillaCalificacion,
  SelectorCategoria,
  SelectorJuez,
  SelectorParticipante,
  TablaResultadosJurado,
} from '@/components/features/gestion-jurado';
import { useGestionJurado } from '@/hooks';
import {
  CATEGORIAS_CONCURSO,
  JURADO_TITULARES,
  PARTICIPANTES_CALIFICACION,
} from '@/mocks';
import type { CategoriaConcurso } from '@/types';

const gradientBorderStyle = {
  borderBottom: '4px solid',
  borderImage: 'linear-gradient(to right, #e30613, #fcee21, #00873e) 1',
};

export function CalificacionJuradoContent() {
  const {
    juezActivoId,
    seleccionarJuez,
    actualizarCriterio,
    emitirCalificacion,
    puntajesDe,
    totalParticipante,
    criteriosDeParticipante,
    criteriosRespondidos,
    evaluacionCompleta,
    estaEmitido,
    progresoJuez,
    resultados,
  } = useGestionJurado(PARTICIPANTES_CALIFICACION, JURADO_TITULARES);

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<CategoriaConcurso | null>(null);
  const [participanteActivoId, setParticipanteActivoId] = useState<
    string | null
  >(null);

  const participantesDeCategoria = useMemo(
    () =>
      PARTICIPANTES_CALIFICACION.filter(
        (participante) => participante.categoria === categoriaSeleccionada,
      ),
    [categoriaSeleccionada],
  );

  const indiceParticipante = participantesDeCategoria.findIndex(
    (p) => p.id === participanteActivoId,
  );
  const participanteActivo =
    indiceParticipante >= 0
      ? participantesDeCategoria[indiceParticipante]
      : null;

  const elegirCategoria = (categoria: CategoriaConcurso) => {
    setCategoriaSeleccionada(categoria);
    setParticipanteActivoId(null);
  };

  return (
    <main className="tema-votacion">
      <div className="container">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-barlow text-2xl font-light text-(--brand-negro)">
              Bienvenido
            </p>
            <h1 className="font-bakbak text-5xl leading-[0.95] font-black text-(--brand-negro) uppercase lg:text-6xl">
              Jurado
            </h1>
            <h1 className="font-gasoek text-5xl leading-[0.95] text-(--brand-cafe) uppercase lg:text-6xl">
              Calificador
            </h1>
            <p className="font-barlow mt-4 max-w-xl text-base leading-relaxed text-(--brand-cafe)">
              Cada jurado califica a un participante a la vez, bajo los mismos
              criterios técnicos y en una escala de 1 a 100 puntos. Una vez
              emitido el voto, la calificación queda bloqueada.
            </p>
          </div>

          <div className="relative mx-auto hidden aspect-square w-full max-w-xs opacity-70 grayscale lg:block">
            <Image
              src="/images/logo_aquicanta.png"
              alt="Aquí Canta Bolivia"
              fill
              className="object-contain"
            />
          </div>
        </header>
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        {/* ── 2. Jurado activo ──────────────────────────────────────────── */}
        <section className="border-b border-black/10 py-8">
          <SelectorJuez
            jueces={JURADO_TITULARES}
            juezActivoId={juezActivoId}
            onSeleccionar={seleccionarJuez}
            progreso={progresoJuez}
            totalParticipantes={PARTICIPANTES_CALIFICACION.length}
          />
        </section>

        {/* ── 3. Elegir categoría ───────────────────────────────────────── */}
        <section className="py-8">
          <h2 className="font-barlow text-lg font-bold text-(--brand-negro)">
            1.{' '}
            <span className="text-(--brand-cafe)">
              Elija la categoría que desea calificar
            </span>
          </h2>
          <div className="mt-4">
            <SelectorCategoria
              categorias={CATEGORIAS_CONCURSO}
              categoriaActiva={categoriaSeleccionada}
              onSeleccionar={elegirCategoria}
              cantidadEnCategoria={(categoria) =>
                PARTICIPANTES_CALIFICACION.filter(
                  (participante) => participante.categoria === categoria,
                ).length
              }
            />
          </div>
        </section>

        {/* ── 4. Elegir participante ────────────────────────────────────── */}
        <section className="py-8">
          <h2 className="font-barlow text-lg font-bold text-(--brand-negro)">
            2.{' '}
            <span className="text-(--brand-cafe)">
              Elija al participante a calificar
            </span>
          </h2>
          <div className="mt-4">
            {!categoriaSeleccionada ? (
              <p className="rounded-2xl border border-black/10 bg-white p-5 text-center font-barlow text-sm text-(--brand-cafe)">
                Seleccione primero una categoría para ver a sus participantes.
              </p>
            ) : participantesDeCategoria.length > 0 ? (
              <SelectorParticipante
                participantes={participantesDeCategoria}
                participanteActivoId={participanteActivoId}
                onSeleccionar={setParticipanteActivoId}
                estaEmitido={(participanteId) =>
                  estaEmitido(juezActivoId, participanteId)
                }
              />
            ) : (
              <p className="rounded-2xl border border-black/10 bg-white p-5 text-center font-barlow text-sm text-(--brand-cafe)">
                Todavía no hay participantes de ejemplo cargados en &ldquo;
                {categoriaSeleccionada}&rdquo;.
              </p>
            )}
          </div>
        </section>

        {participanteActivo && (
          <section className="py-8">
            <PlanillaCalificacion
              participante={participanteActivo}
              numero={indiceParticipante + 1}
              totalParticipantes={participantesDeCategoria.length}
              criterios={criteriosDeParticipante(participanteActivo.id)}
              puntajes={puntajesDe(juezActivoId, participanteActivo.id)}
              total={totalParticipante(juezActivoId, participanteActivo.id)}
              criteriosRespondidos={criteriosRespondidos(
                juezActivoId,
                participanteActivo.id,
              )}
              criteriosCompletos={evaluacionCompleta(
                juezActivoId,
                participanteActivo.id,
              )}
              emitido={estaEmitido(juezActivoId, participanteActivo.id)}
              onCambiarCriterio={(clave, valor) =>
                actualizarCriterio(participanteActivo.id, clave, valor)
              }
              onEmitir={() => emitirCalificacion(participanteActivo.id)}
            />
          </section>
        )}

        <section className="py-8">
          <h2 className="font-bakbak mb-5 text-xl font-black text-(--brand-negro)">
            Resultados Consolidados
          </h2>
          <TablaResultadosJurado resultados={resultados} />
        </section>
      </div>

      {/* ── 5. Franja fotográfica ────────────────────────────────────────── */}
      <section
        className="relative mt-10 h-72 overflow-hidden lg:h-80"
        style={gradientBorderStyle}
      >
        <Image
          src="/images/header.jpg"
          alt=""
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-(--brand-negro)/70" />
      </section>
    </main>
  );
}

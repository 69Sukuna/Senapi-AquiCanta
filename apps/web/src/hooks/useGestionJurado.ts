'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CRITERIOS_POR_CATEGORIA } from '@/mocks';
import type {
  ClaveCriterioEvaluacion,
  CriterioEvaluacionDefinicion,
  EmisionesPorJurado,
  JuezPerfil,
  ParticipanteCalificacion,
  PuntajesPorJurado,
  ResultadoConsolidadoJurado,
} from '@/types';

const STORAGE_KEY = 'gestion-jurado:estado';

interface EstadoJurado {
  puntajes: PuntajesPorJurado;
  emitidos: EmisionesPorJurado;
}

const ESTADO_INICIAL: EstadoJurado = { puntajes: {}, emitidos: {} };

interface UseGestionJuradoResult {
  juezActivoId: string;
  seleccionarJuez: (juezId: string) => void;
  actualizarCriterio: (participanteId: string, clave: ClaveCriterioEvaluacion, valor: number) => void;
  emitirCalificacion: (participanteId: string) => void;
  puntajesDe: (juezId: string, participanteId: string) => PuntajesPorJurado[string][string];
  totalParticipante: (juezId: string, participanteId: string) => number;
  criteriosDeParticipante: (participanteId: string) => CriterioEvaluacionDefinicion[];
  criteriosRespondidos: (juezId: string, participanteId: string) => number;
  evaluacionCompleta: (juezId: string, participanteId: string) => boolean;
  estaEmitido: (juezId: string, participanteId: string) => boolean;
  progresoJuez: (juezId: string) => number;
  resultados: ResultadoConsolidadoJurado[];
}

export function useGestionJurado(
  participantes: ParticipanteCalificacion[],
  jueces: JuezPerfil[],
): UseGestionJuradoResult {
  const [juezActivoId, setJuezActivoId] = useState(jueces[0]?.id ?? '');
  const [estado, setEstado] = useState<EstadoJurado>(ESTADO_INICIAL);

  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem(STORAGE_KEY);
      if (guardado) setEstado(JSON.parse(guardado) as EstadoJurado);
    } catch {
      // sessionStorage no disponible: se continúa solo en memoria.
    }
  }, []);

  const persistir = useCallback((actualizado: EstadoJurado) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(actualizado));
    } catch {
      // sessionStorage no disponible: el puntaje ya quedó reflejado en memoria.
    }
  }, []);

  // Cada categoría tiene su propio baremo (Guía Explicativa §5), así que los
  // criterios y su puntaje máximo dependen de la categoría del participante.
  const criteriosDeParticipante = useCallback(
    (participanteId: string): CriterioEvaluacionDefinicion[] => {
      const participante = participantes.find((p) => p.id === participanteId);
      return participante ? CRITERIOS_POR_CATEGORIA[participante.categoria] ?? [] : [];
    },
    [participantes],
  );

  const actualizarCriterio = useCallback(
    (participanteId: string, clave: ClaveCriterioEvaluacion, valor: number) => {
      setEstado((actual) => {
        // Una calificación ya emitida queda bloqueada: no se admite ninguna modificación.
        if (actual.emitidos[juezActivoId]?.[participanteId]) return actual;

        const criterio = criteriosDeParticipante(participanteId).find((c) => c.clave === clave);
        const maximo = criterio?.puntajeMaximo ?? 0;
        const valorValido = Math.min(maximo, Math.max(0, valor));
        const puntajesJuez = actual.puntajes[juezActivoId] ?? {};
        const puntajesParticipante = puntajesJuez[participanteId] ?? {};

        const actualizado: EstadoJurado = {
          ...actual,
          puntajes: {
            ...actual.puntajes,
            [juezActivoId]: {
              ...puntajesJuez,
              [participanteId]: { ...puntajesParticipante, [clave]: valorValido },
            },
          },
        };

        persistir(actualizado);
        return actualizado;
      });
    },
    [juezActivoId, persistir, criteriosDeParticipante],
  );

  const emitirCalificacion = useCallback(
    (participanteId: string) => {
      setEstado((actual) => {
        if (actual.emitidos[juezActivoId]?.[participanteId]) return actual;

        const puntajes = actual.puntajes[juezActivoId]?.[participanteId] ?? {};
        const totalCriterios = criteriosDeParticipante(participanteId).length;
        if (totalCriterios === 0 || Object.keys(puntajes).length !== totalCriterios) return actual;

        const actualizado: EstadoJurado = {
          ...actual,
          emitidos: {
            ...actual.emitidos,
            [juezActivoId]: { ...(actual.emitidos[juezActivoId] ?? {}), [participanteId]: true },
          },
        };

        persistir(actualizado);
        return actualizado;
      });
    },
    [juezActivoId, persistir, criteriosDeParticipante],
  );

  const puntajesDe = useCallback(
    (juezId: string, participanteId: string) => estado.puntajes[juezId]?.[participanteId] ?? {},
    [estado.puntajes],
  );

  const totalParticipante = useCallback(
    (juezId: string, participanteId: string) => {
      const puntajes = estado.puntajes[juezId]?.[participanteId] ?? {};
      return Object.values(puntajes).reduce<number>((acumulado, valor) => acumulado + (valor ?? 0), 0);
    },
    [estado.puntajes],
  );

  const criteriosRespondidos = useCallback(
    (juezId: string, participanteId: string) => Object.keys(estado.puntajes[juezId]?.[participanteId] ?? {}).length,
    [estado.puntajes],
  );

  const evaluacionCompleta = useCallback(
    (juezId: string, participanteId: string) => {
      const totalCriterios = criteriosDeParticipante(participanteId).length;
      return totalCriterios > 0 && criteriosRespondidos(juezId, participanteId) === totalCriterios;
    },
    [criteriosRespondidos, criteriosDeParticipante],
  );

  const estaEmitido = useCallback(
    (juezId: string, participanteId: string) => Boolean(estado.emitidos[juezId]?.[participanteId]),
    [estado.emitidos],
  );

  const progresoJuez = useCallback(
    (juezId: string) => participantes.filter((participante) => estaEmitido(juezId, participante.id)).length,
    [participantes, estaEmitido],
  );

  const resultados = useMemo<ResultadoConsolidadoJurado[]>(() => {
    const calculados = participantes.map((participante) => {
      const totales = jueces
        .filter((juez) => estaEmitido(juez.id, participante.id))
        .map((juez) => totalParticipante(juez.id, participante.id));

      const promedio = totales.length > 0 ? totales.reduce((a, b) => a + b, 0) / totales.length : null;

      return {
        participanteId: participante.id,
        nombreArtistico: participante.nombreArtistico,
        categoria: participante.categoria,
        promedio,
        juecesQueCalificaron: totales.length,
        totalJueces: jueces.length,
        puesto: null as number | null,
      };
    });

    const conPromedio = calculados
      .filter((resultado) => resultado.promedio !== null)
      .sort((a, b) => (b.promedio as number) - (a.promedio as number))
      .map((resultado, indice) => ({ ...resultado, puesto: indice + 1 }));

    const sinPromedio = calculados.filter((resultado) => resultado.promedio === null);

    return [...conPromedio, ...sinPromedio];
  }, [participantes, jueces, estaEmitido, totalParticipante]);

  return {
    juezActivoId,
    seleccionarJuez: setJuezActivoId,
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
  };
}

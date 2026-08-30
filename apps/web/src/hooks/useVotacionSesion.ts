'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ConteoVotos } from '@/types';

interface UseVotacionSesionParams {
  storageKey: string;
  conteoInicial: ConteoVotos;
}

interface UseVotacionSesionResult {
  conteoVotos: ConteoVotos;
  participanteVotadoId: string | null;
  yaVoto: boolean;
  listo: boolean;
  votar: (participanteId: string) => boolean;
}

export function useVotacionSesion({ storageKey, conteoInicial }: UseVotacionSesionParams): UseVotacionSesionResult {
  const [conteoVotos, setConteoVotos] = useState<ConteoVotos>(conteoInicial);
  const [participanteVotadoId, setParticipanteVotadoId] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    try {
      const conteoGuardado = sessionStorage.getItem(`${storageKey}:conteo`);
      const votoGuardado = sessionStorage.getItem(`${storageKey}:voto`);

      if (conteoGuardado) setConteoVotos(JSON.parse(conteoGuardado) as ConteoVotos);
      if (votoGuardado) setParticipanteVotadoId(votoGuardado);
    } catch {
    } finally {
      setListo(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const votar = useCallback(
    (participanteId: string) => {
      if (participanteVotadoId) return false;

      const nuevoConteo: ConteoVotos = {
        ...conteoVotos,
        [participanteId]: (conteoVotos[participanteId] ?? 0) + 1,
      };

      setConteoVotos(nuevoConteo);
      setParticipanteVotadoId(participanteId);

      try {
        sessionStorage.setItem(`${storageKey}:conteo`, JSON.stringify(nuevoConteo));
        sessionStorage.setItem(`${storageKey}:voto`, participanteId);
      } catch {
      }

      return true;
    },
    [conteoVotos, participanteVotadoId, storageKey],
  );

  return {
    conteoVotos,
    participanteVotadoId,
    yaVoto: participanteVotadoId !== null,
    listo,
    votar,
  };
}

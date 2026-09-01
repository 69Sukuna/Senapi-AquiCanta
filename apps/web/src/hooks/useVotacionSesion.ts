'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ConteoVotos } from '@/types';

interface UseVotacionSesionParams {
  storageKey: string;
  conteoInicial: ConteoVotos;
}

// Un voto por categoría: mapea el nombre de la categoría al id del
// participante votado en esa categoría.
type VotosPorCategoria = Record<string, string>;

interface UseVotacionSesionResult {
  conteoVotos: ConteoVotos;
  votosPorCategoria: VotosPorCategoria;
  listo: boolean;
  yaVotoEnCategoria: (categoria: string) => boolean;
  votar: (participanteId: string, categoria: string) => boolean;
}

export function useVotacionSesion({ storageKey, conteoInicial }: UseVotacionSesionParams): UseVotacionSesionResult {
  const [conteoVotos, setConteoVotos] = useState<ConteoVotos>(conteoInicial);
  const [votosPorCategoria, setVotosPorCategoria] = useState<VotosPorCategoria>({});
  const [listo, setListo] = useState(false);

  useEffect(() => {
    try {
      const conteoGuardado = sessionStorage.getItem(`${storageKey}:conteo`);
      const votosGuardados = sessionStorage.getItem(`${storageKey}:votos-categoria`);

      if (conteoGuardado) setConteoVotos(JSON.parse(conteoGuardado) as ConteoVotos);
      if (votosGuardados) setVotosPorCategoria(JSON.parse(votosGuardados) as VotosPorCategoria);
    } catch {
    } finally {
      setListo(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const yaVotoEnCategoria = useCallback(
    (categoria: string) => votosPorCategoria[categoria] !== undefined,
    [votosPorCategoria],
  );

  const votar = useCallback(
    (participanteId: string, categoria: string) => {
      // Restricción estricta: 1 voto por categoría. Si ya hay un voto
      // registrado en esta categoría (sea para este participante u otro), no
      // se admite uno nuevo.
      if (votosPorCategoria[categoria]) return false;

      const nuevoConteo: ConteoVotos = {
        ...conteoVotos,
        [participanteId]: (conteoVotos[participanteId] ?? 0) + 1,
      };
      const nuevosVotos: VotosPorCategoria = { ...votosPorCategoria, [categoria]: participanteId };

      setConteoVotos(nuevoConteo);
      setVotosPorCategoria(nuevosVotos);

      try {
        sessionStorage.setItem(`${storageKey}:conteo`, JSON.stringify(nuevoConteo));
        sessionStorage.setItem(`${storageKey}:votos-categoria`, JSON.stringify(nuevosVotos));
      } catch {
      }

      return true;
    },
    [conteoVotos, votosPorCategoria, storageKey],
  );

  return {
    conteoVotos,
    votosPorCategoria,
    listo,
    yaVotoEnCategoria,
    votar,
  };
}

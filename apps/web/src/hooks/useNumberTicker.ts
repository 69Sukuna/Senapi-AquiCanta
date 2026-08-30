'use client';

import { useEffect, useRef, useState } from 'react';

function crearCubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  const muestrearX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const muestrearY = (t: number) => ((ay * t + by) * t + cy) * t;
  const derivadaX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number): number => {
    let t = x;
    for (let iteracion = 0; iteracion < 8; iteracion += 1) {
      const diferenciaX = muestrearX(t) - x;
      const derivada = derivadaX(t);
      if (Math.abs(derivada) < 1e-6) break;
      t -= diferenciaX / derivada;
    }
    return muestrearY(t);
  };
}

const suavizarProgreso = crearCubicBezier(0.4, 0, 0.2, 1);
const DURACION_POR_DEFECTO_MS = 900;

export function useNumberTicker(valorObjetivo: number, duracionMs = DURACION_POR_DEFECTO_MS): number {
  const [valorMostrado, setValorMostrado] = useState(valorObjetivo);
  const valorActualRef = useRef(valorObjetivo);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);

    const valorInicial = valorActualRef.current;
    const delta = valorObjetivo - valorInicial;

    if (delta === 0) return;

    const inicio = performance.now();

    const animar = (ahora: number) => {
      const progreso = Math.min(1, (ahora - inicio) / duracionMs);
      const valorInterpolado = valorInicial + delta * suavizarProgreso(progreso);

      valorActualRef.current = valorInterpolado;
      setValorMostrado(valorInterpolado);

      if (progreso < 1) {
        frameRef.current = requestAnimationFrame(animar);
      }
    };

    frameRef.current = requestAnimationFrame(animar);

    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [valorObjetivo, duracionMs]);

  return valorMostrado;
}

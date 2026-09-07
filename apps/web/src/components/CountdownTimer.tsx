'use client';

import { useEffect, useState } from 'react';

// TODO: reemplazar por la fecha real del festival (o del cierre de
// inscripciones) en cuanto la organización la confirme — es el único
// lugar que hay que tocar para actualizar el countdown en todo el sitio.
const FECHA_OBJETIVO = new Date('2026-11-14T19:00:00-04:00').getTime();

function calcularRestante() {
  const diff = Math.max(0, FECHA_OBJETIVO - Date.now());
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / (1000 * 60)) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}

// Empieza en null a propósito: el primer render del cliente coincide con el
// del servidor (ambos muestran "--"), y useEffect recién calcula el valor
// real después — así se evita un mismatch de hidratación por el reloj.
export function CountdownTimer() {
  const [restante, setRestante] = useState<ReturnType<typeof calcularRestante> | null>(null);

  useEffect(() => {
    setRestante(calcularRestante());
    const interval = setInterval(() => setRestante(calcularRestante()), 1000);
    return () => clearInterval(interval);
  }, []);

  const unidades: { label: string; value: number | undefined }[] = [
    { label: 'DÍAS', value: restante?.dias },
    { label: 'HORAS', value: restante?.horas },
    { label: 'MINUTOS', value: restante?.minutos },
    { label: 'SEGUNDOS', value: restante?.segundos },
  ];

  return (
    <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
      {unidades.map(({ label, value }) => (
        <div key={label} className="flex min-w-[56px] flex-col items-center sm:min-w-[70px]">
          <span className="font-bakbak text-5xl! leading-none text-white sm:text-6xl! lg:text-8xl!">
            {value !== undefined ? String(value).padStart(2, '0') : '--'}
          </span>
          <span className="font-barlow mt-1.5! text-xs! font-semibold tracking-[0.18em] text-white/85 uppercase sm:text-[20px]!">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

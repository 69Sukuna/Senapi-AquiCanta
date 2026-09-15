'use client';

import { useState } from 'react';
import { CategoriaModal } from './CategoriaModal';

interface CategoriaCardProps {
  nombre: string;
}

// Tarjeta oscura (paleta y tipografías de la home: font-bakbak/font-barlow,
// gradiente de marca rojo→amarillo→verde). Sin `!` porque no toca margin/
// padding fuera de capa ni color de <a> — ver el comentario del mismo tipo
// en CategoriaModal.tsx si esto se vuelve a necesitar acá.
export function CategoriaCard({ nombre }: CategoriaCardProps) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="group relative flex min-h-56 w-full flex-col justify-between overflow-hidden rounded-[28px] bg-(--brand-negro) p-6 text-left shadow-[0_18px_40px_-20px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_60px_-18px_rgba(0,0,0,0.65)] sm:min-h-64"
      >
        {/* Barra de gradiente de marca, se agranda al pasar el mouse */}
        <span className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#e30613_0%,#fcee21_50%,#00873e_100%)] transition-all duration-300 group-hover:h-3" />

        {/* Resplandor de color detrás del título, solo visible al hover */}
        <span className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-(--brand-amarillo) opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25" />

        <div className="relative">
          <span className="font-barlow text-[11px] font-semibold tracking-[0.25em] text-white/50 uppercase">
            Categoría
          </span>
          <h3 className="font-bakbak mt-3 text-2xl leading-[1.05] text-white sm:text-[1.65rem]">{nombre}</h3>
        </div>

        <span className="font-barlow relative inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-(--brand-amarillo) transition-transform duration-300 group-hover:translate-x-1.5">
          Ver detalles
          <span aria-hidden="true">→</span>
        </span>
      </button>

      {abierta && <CategoriaModal nombre={nombre} onClose={() => setAbierta(false)} />}
    </>
  );
}

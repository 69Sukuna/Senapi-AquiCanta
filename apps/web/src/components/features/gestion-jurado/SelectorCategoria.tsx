'use client';

import type { CategoriaConcurso } from '@/types';

const gradientTricolor = 'linear-gradient(to right, #e30613, #fcee21, #00873e)';

interface SelectorCategoriaProps {
  categorias: CategoriaConcurso[];
  categoriaActiva: CategoriaConcurso | null;
  onSeleccionar: (categoria: CategoriaConcurso) => void;
  cantidadEnCategoria: (categoria: CategoriaConcurso) => number;
}

export function SelectorCategoria({
  categorias,
  categoriaActiva,
  onSeleccionar,
  cantidadEnCategoria,
}: SelectorCategoriaProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup" aria-label="Elegir categoría">
      {categorias.map((categoria) => {
        const activa = categoria === categoriaActiva;
        const cantidad = cantidadEnCategoria(categoria);

        return (
          <button
            key={categoria}
            type="button"
            role="radio"
            aria-checked={activa}
            onClick={() => onSeleccionar(categoria)}
            className={`relative flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border px-4 py-6 text-center shadow-sm transition-colors ${
              activa
                ? 'border-(--brand-cafe) bg-(--brand-cafe) text-white'
                : 'border-black/10 bg-white text-(--brand-negro) hover:border-(--brand-cafe)/40'
            }`}
          >
            <span className="absolute inset-x-0 top-0 h-1" style={{ background: gradientTricolor }} />
            <span className="font-barlow text-sm leading-snug font-bold uppercase">{categoria}</span>
            <span
              className={`font-barlow text-[0.65rem] font-semibold tracking-wide uppercase ${
                activa ? 'text-white/70' : 'text-(--brand-cafe)/60'
              }`}
            >
              {cantidad} {cantidad === 1 ? 'participante' : 'participantes'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

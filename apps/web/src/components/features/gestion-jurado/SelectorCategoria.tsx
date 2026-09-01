'use client';

import type { CategoriaConcurso } from '@/types';

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
            className="vt-card flex flex-col items-center justify-center gap-2 px-4 py-6 text-center"
            style={
              activa ? { borderColor: 'var(--vt-border-active)', background: 'rgba(224, 165, 39, 0.1)' } : undefined
            }
          >
            <span
              className={`text-sm leading-snug font-extrabold ${
                activa ? 'text-[var(--vt-mustard-light)]' : 'text-[var(--vt-text-primary)]'
              }`}
            >
              {categoria}
            </span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--vt-text-muted)]">
              {cantidad} {cantidad === 1 ? 'participante' : 'participantes'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

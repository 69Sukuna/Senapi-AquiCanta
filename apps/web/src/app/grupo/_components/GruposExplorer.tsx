'use client';

import { useMemo, useState } from 'react';
import { GrupoCard } from './GrupoCard';

interface Grupo {
  id: string;
  nombre: string;
  fotoUrl: string | null;
  departamento: string | null;
  categoria: { id: string; nombre: string };
  integrantes: unknown[];
}

interface Categoria {
  id: string;
  nombre: string;
}

interface GruposExplorerProps {
  grupos: Grupo[];
  categorias: Categoria[];
}

// Mismo patrón que cantante/_components/CantantesExplorer.tsx: filtrado
// 100% en cliente sobre la lista ya traída del servidor.
export function GruposExplorer({ grupos, categorias }: GruposExplorerProps) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return grupos.filter((grupo) => {
      const coincideCategoria = !categoriaId || grupo.categoria.id === categoriaId;
      const coincideBusqueda = !query || grupo.nombre.toLowerCase().includes(query);
      return coincideCategoria && coincideBusqueda;
    });
  }, [grupos, busqueda, categoriaId]);

  return (
    <div>
      <div className="mt-10! flex flex-col gap-4">
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4! -translate-y-1/2 text-[rgba(253,246,236,0.4)]"
          >
            🔍
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar grupo por nombre..."
            className="w-full rounded-full border border-[rgba(224,165,39,0.25)] bg-[rgba(40,10,15,0.55)] py-3! pr-5! pl-11! text-[#fdf6ec] placeholder-[rgba(253,246,236,0.4)] backdrop-blur-md outline-none transition-colors duration-200 focus:border-[rgba(224,165,39,0.6)]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoriaId(null)}
            className={`rounded-full border px-4! py-1.5! text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${
              categoriaId === null
                ? 'border-transparent bg-gradient-to-r from-[#f4c94f] to-[#e0a527] text-[#170406]'
                : 'border-[rgba(224,165,39,0.3)] text-[rgba(253,246,236,0.7)] hover:border-[rgba(224,165,39,0.6)]'
            }`}
          >
            Todas
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => setCategoriaId(categoria.id)}
              className={`rounded-full border px-4! py-1.5! text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${
                categoriaId === categoria.id
                  ? 'border-transparent bg-gradient-to-r from-[#f4c94f] to-[#e0a527] text-[#170406]'
                  : 'border-[rgba(224,165,39,0.3)] text-[rgba(253,246,236,0.7)] hover:border-[rgba(224,165,39,0.6)]'
              }`}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {filtrados.length > 0 ? (
        <div className="mt-8! grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((grupo) => (
            <GrupoCard
              key={grupo.id}
              id={grupo.id}
              nombre={grupo.nombre}
              fotoUrl={grupo.fotoUrl}
              categoriaNombre={grupo.categoria.nombre}
              departamento={grupo.departamento}
              integrantesCount={grupo.integrantes.length}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8! rounded-2xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
          Ningún grupo coincide con la búsqueda o el filtro.
        </div>
      )}
    </div>
  );
}

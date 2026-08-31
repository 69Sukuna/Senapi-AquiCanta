'use client';

import { useMemo, useState } from 'react';
import { CantanteCard } from './CantanteCard';

interface Cantante {
  id: string;
  nombre: string;
  fotoUrl: string | null;
  departamento: string | null;
  categoria: { id: string; nombre: string };
}

interface Categoria {
  id: string;
  nombre: string;
}

interface CantantesExplorerProps {
  cantantes: Cantante[];
  categorias: Categoria[];
}

// Filtrado 100% en cliente: la lista completa ya llegó del servidor, así que
// buscar/filtrar es instantáneo y no necesita ida y vuelta a la API.
export function CantantesExplorer({ cantantes, categorias }: CantantesExplorerProps) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return cantantes.filter((cantante) => {
      const coincideCategoria = !categoriaId || cantante.categoria.id === categoriaId;
      const coincideBusqueda = !query || cantante.nombre.toLowerCase().includes(query);
      return coincideCategoria && coincideBusqueda;
    });
  }, [cantantes, busqueda, categoriaId]);

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
            placeholder="Buscar cantante por nombre..."
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
          {filtrados.map((cantante) => (
            <CantanteCard
              key={cantante.id}
              id={cantante.id}
              nombre={cantante.nombre}
              fotoUrl={cantante.fotoUrl}
              categoriaNombre={cantante.categoria.nombre}
              departamento={cantante.departamento}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8! rounded-2xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
          Ningún cantante coincide con la búsqueda o el filtro.
        </div>
      )}
    </div>
  );
}

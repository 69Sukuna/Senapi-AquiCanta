'use client';

import { useMemo, useState } from 'react';
import { ParticipanteCard } from '@/components/ParticipanteCard';
import type { Participante } from '../page';

interface Categoria {
  id: string;
  nombre: string;
}

interface ParticipantesExplorerProps {
  participantes: Participante[];
  categorias: Categoria[];
}

type FiltroTipo = 'TODOS' | 'CANTANTE' | 'GRUPO';

// Filtrado 100% en cliente: la lista completa ya llegó del servidor, así que
// buscar/filtrar es instantáneo y no necesita ida y vuelta a la API.
export function ParticipantesExplorer({ participantes, categorias }: ParticipantesExplorerProps) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [tipo, setTipo] = useState<FiltroTipo>('TODOS');

  const filtrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return participantes.filter((participante) => {
      const coincideTipo = tipo === 'TODOS' || participante.tipo === tipo;
      const coincideCategoria = !categoriaId || participante.categoria.id === categoriaId;
      const coincideBusqueda = !query || participante.nombre.toLowerCase().includes(query);
      return coincideTipo && coincideCategoria && coincideBusqueda;
    });
  }, [participantes, busqueda, categoriaId, tipo]);

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
            placeholder="Buscar participante por nombre..."
            className="w-full rounded-full border border-[rgba(224,165,39,0.25)] bg-[rgba(40,10,15,0.55)] py-3! pr-5! pl-11! text-[#fdf6ec] placeholder-[rgba(253,246,236,0.4)] backdrop-blur-md outline-none transition-colors duration-200 focus:border-[rgba(224,165,39,0.6)]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'TODOS', label: 'Todos' },
              { id: 'CANTANTE', label: 'Solistas' },
              { id: 'GRUPO', label: 'Grupos' },
            ] as const
          ).map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              onClick={() => setTipo(opcion.id)}
              className={`rounded-full border px-4! py-1.5! text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${
                tipo === opcion.id
                  ? 'border-transparent bg-gradient-to-r from-[#ff4d5e] to-[#e11d2e] text-[#fdf6ec]'
                  : 'border-[rgba(224,165,39,0.3)] text-[rgba(253,246,236,0.7)] hover:border-[rgba(224,165,39,0.6)]'
              }`}
            >
              {opcion.label}
            </button>
          ))}
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
            Todas las categorías
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
          {filtrados.map((participante) => (
            <ParticipanteCard
              key={`${participante.tipo}-${participante.id}`}
              tipo={participante.tipo}
              id={participante.id}
              nombre={participante.nombre}
              fotoUrl={participante.fotoUrl}
              categoriaNombre={participante.categoria.nombre}
              departamento={participante.departamento}
              integrantesCount={participante.integrantesCount}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8! rounded-2xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
          Ningún participante coincide con la búsqueda o el filtro.
        </div>
      )}
    </div>
  );
}

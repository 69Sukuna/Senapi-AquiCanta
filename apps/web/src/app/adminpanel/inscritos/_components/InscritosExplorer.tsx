'use client';

import { useEffect, useMemo, useState } from 'react';
import { DepartamentoBadge } from '@/components/DepartamentoBadge';
import { ORDEN_ESTADOS, ESTADOS_INSCRIPCION, type EstadoInscripcion } from '@/lib/estadoInscripcion';
import { fetchAdmin } from '@/lib/auth';
import { EstadoBadge } from './EstadoBadge';
import { InscritoModal } from './InscritoModal';
import type { Inscrito } from './tipos';

type FiltroTipo = 'TODOS' | 'CANTANTE' | 'GRUPO';
type FiltroEstado = 'TODOS' | EstadoInscripcion;
type Columna = 'nombre' | 'categoria' | 'estado' | 'fecha';
type Direccion = 'asc' | 'desc';

// timeZone fija a propósito — evita un mismatch de hidratación si el
// servidor (Node) y el navegador corren en zonas horarias distintas.
const formateadorFecha = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/La_Paz',
});

export function InscritosExplorer() {
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS');
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [columnaOrden, setColumnaOrden] = useState<Columna>('fecha');
  const [direccionOrden, setDireccionOrden] = useState<Direccion>('desc');
  const [seleccionado, setSeleccionado] = useState<Inscrito | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetchAdmin('/inscripciones')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelado) setInscritos(data);
      })
      .catch(() => {
        if (!cancelado) setError(true);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const categorias = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const inscrito of inscritos) mapa.set(inscrito.categoria.id, inscrito.categoria.nombre);
    return Array.from(mapa, ([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [inscritos]);

  const filtrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();

    const resultado = inscritos.filter((inscrito) => {
      const coincideTipo = filtroTipo === 'TODOS' || inscrito.tipo === filtroTipo;
      const coincideEstado = filtroEstado === 'TODOS' || inscrito.estado === filtroEstado;
      const coincideCategoria = !filtroCategoria || inscrito.categoriaId === filtroCategoria;
      const coincideBusqueda =
        !query || inscrito.nombre.toLowerCase().includes(query) || inscrito.id.toLowerCase().includes(query);
      return coincideTipo && coincideEstado && coincideCategoria && coincideBusqueda;
    });

    const factor = direccionOrden === 'asc' ? 1 : -1;
    resultado.sort((a, b) => {
      switch (columnaOrden) {
        case 'nombre':
          return factor * a.nombre.localeCompare(b.nombre);
        case 'categoria':
          return factor * a.categoria.nombre.localeCompare(b.categoria.nombre);
        case 'estado':
          return factor * a.estado.localeCompare(b.estado);
        case 'fecha':
        default:
          return factor * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
    });

    return resultado;
  }, [inscritos, busqueda, filtroTipo, filtroEstado, filtroCategoria, columnaOrden, direccionOrden]);

  function alternarOrden(columna: Columna) {
    if (columna === columnaOrden) {
      setDireccionOrden((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setColumnaOrden(columna);
      setDireccionOrden('asc');
    }
  }

  function onActualizado(actualizado: Inscrito) {
    setInscritos((lista) =>
      lista.map((item) => (item.tipo === actualizado.tipo && item.id === actualizado.id ? actualizado : item)),
    );
    setSeleccionado(actualizado);
  }

  if (cargando) {
    return <p className="mt-10! text-(--text-muted)">Cargando inscritos...</p>;
  }

  if (error) {
    return (
      <div className="mt-10! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
        No se pudieron cargar los inscritos.
      </div>
    );
  }

  return (
    <div>
      {/* Búsqueda + filtros */}
      <div className="mt-10! flex flex-col gap-4">
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4! -translate-y-1/2 text-(--text-muted)">
            🔍
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o ID..."
            className="w-full rounded-full border border-(--border) bg-white py-3! pr-5! pl-11! text-(--text-primary) placeholder-(--text-muted) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
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
              onClick={() => setFiltroTipo(opcion.id)}
              className={`rounded-full border px-4! py-1.5! text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${
                filtroTipo === opcion.id
                  ? 'border-transparent bg-[#1e63b8] text-white'
                  : 'border-(--border) text-(--text-secondary) hover:border-[#1e63b8]/40 hover:text-(--text-primary)'
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFiltroEstado('TODOS')}
            className={`rounded-full border px-4! py-1.5! text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${
              filtroEstado === 'TODOS'
                ? 'border-transparent bg-[#1e63b8] text-white'
                : 'border-(--border) text-(--text-secondary) hover:border-[#1e63b8]/40 hover:text-(--text-primary)'
            }`}
          >
            Todos los estados
          </button>
          {ORDEN_ESTADOS.map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => setFiltroEstado(estado)}
              className={`rounded-full border px-4! py-1.5! text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${
                filtroEstado === estado
                  ? 'border-transparent bg-[#1e63b8] text-white'
                  : 'border-(--border) text-(--text-secondary) hover:border-[#1e63b8]/40 hover:text-(--text-primary)'
              }`}
            >
              {ESTADOS_INSCRIPCION[estado].label}
            </button>
          ))}
        </div>

        {categorias.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltroCategoria(null)}
              className={`rounded-full border px-4! py-1.5! text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${
                filtroCategoria === null
                  ? 'border-transparent bg-[#1e63b8] text-white'
                  : 'border-(--border) text-(--text-secondary) hover:border-[#1e63b8]/40 hover:text-(--text-primary)'
              }`}
            >
              Todas las categorías
            </button>
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                onClick={() => setFiltroCategoria(categoria.id)}
                className={`rounded-full border px-4! py-1.5! text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${
                  filtroCategoria === categoria.id
                    ? 'border-transparent bg-[#1e63b8] text-white'
                    : 'border-(--border) text-(--text-secondary) hover:border-[#1e63b8]/40 hover:text-(--text-primary)'
                }`}
              >
                {categoria.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4! text-sm text-(--text-muted)">
        {filtrados.length} {filtrados.length === 1 ? 'resultado' : 'resultados'} de {inscritos.length} inscritos
      </p>

      {/* Tabla */}
      {filtrados.length > 0 ? (
        <div className="mt-4! overflow-x-auto rounded-2xl border border-(--border)">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-(--border) bg-(--bg-secondary)">
                <th className="px-4! py-3! font-bold text-(--text-secondary)">ID</th>
                <EncabezadoOrdenable columna="nombre" actual={columnaOrden} direccion={direccionOrden} onClick={alternarOrden}>
                  Nombre
                </EncabezadoOrdenable>
                <EncabezadoOrdenable columna="categoria" actual={columnaOrden} direccion={direccionOrden} onClick={alternarOrden}>
                  Categoría
                </EncabezadoOrdenable>
                <th className="px-4! py-3! font-bold text-(--text-secondary)">Tipo</th>
                <th className="px-4! py-3! font-bold text-(--text-secondary)">Depto.</th>
                <EncabezadoOrdenable columna="estado" actual={columnaOrden} direccion={direccionOrden} onClick={alternarOrden}>
                  Estado
                </EncabezadoOrdenable>
                <EncabezadoOrdenable columna="fecha" actual={columnaOrden} direccion={direccionOrden} onClick={alternarOrden}>
                  Inscrito
                </EncabezadoOrdenable>
                <th className="px-4! py-3! font-bold text-(--text-secondary)" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((inscrito) => (
                <tr
                  key={`${inscrito.tipo}-${inscrito.id}`}
                  onClick={() => setSeleccionado(inscrito)}
                  className="cursor-pointer border-b border-(--border) last:border-0 hover:bg-(--bg-card-hover)"
                >
                  <td className="px-4! py-3! font-mono text-xs text-(--text-muted)">{inscrito.id.slice(0, 8)}</td>
                  <td className="px-4! py-3! font-semibold text-(--text-primary)">
                    {inscrito.nombre}
                    {inscrito.pseudonimo && (
                      <span className="ml-1.5! font-normal text-(--text-muted)">“{inscrito.pseudonimo}”</span>
                    )}
                  </td>
                  <td className="px-4! py-3! text-(--text-secondary)">{inscrito.categoria.nombre}</td>
                  <td className="px-4! py-3! text-(--text-secondary)">
                    {inscrito.tipo === 'CANTANTE' ? 'Individual' : 'Grupal'}
                  </td>
                  <td className="px-4! py-3!">
                    <DepartamentoBadge departamento={inscrito.departamento} />
                  </td>
                  <td className="px-4! py-3!">
                    <EstadoBadge estado={inscrito.estado} />
                  </td>
                  <td className="px-4! py-3! text-(--text-secondary)">{formateadorFecha.format(new Date(inscrito.createdAt))}</td>
                  <td className="px-4! py-3!">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeleccionado(inscrito);
                      }}
                      className="rounded-full border border-(--border) px-3! py-1! text-xs font-bold text-(--text-secondary) transition-colors duration-200 hover:border-[#1e63b8]/40 hover:text-(--text-primary)"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
          Ningún inscrito coincide con la búsqueda o los filtros.
        </div>
      )}

      {seleccionado && (
        <InscritoModal inscrito={seleccionado} onClose={() => setSeleccionado(null)} onActualizado={onActualizado} />
      )}
    </div>
  );
}

function EncabezadoOrdenable({
  columna,
  actual,
  direccion,
  onClick,
  children,
}: {
  columna: Columna;
  actual: Columna;
  direccion: Direccion;
  onClick: (columna: Columna) => void;
  children: React.ReactNode;
}) {
  const activo = columna === actual;
  return (
    <th className="px-4! py-3! font-bold text-(--text-secondary)">
      <button
        type="button"
        onClick={() => onClick(columna)}
        className={`inline-flex! items-center gap-1 transition-colors duration-200 hover:text-(--text-primary) ${activo ? 'text-(--text-primary)' : ''}`}
      >
        {children}
        <span aria-hidden="true" className="text-[10px] text-(--text-muted)">
          {activo ? (direccion === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  );
}

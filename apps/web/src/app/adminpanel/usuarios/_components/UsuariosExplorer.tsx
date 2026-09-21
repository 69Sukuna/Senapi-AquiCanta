'use client';

import { useEffect, useMemo, useState } from 'react';
import { DepartamentoBadge } from '@/components/DepartamentoBadge';
import { fetchAdmin } from '@/lib/auth';
import { useUsuarioAdmin } from '../../_components/UsuarioAdminContext';
import { botonPeligro, botonPrimario, botonSecundario } from '../../sellos/_components/ui';
import { UsuarioModal } from './UsuarioModal';
import { ETIQUETA_ROL, mensajeDeError, type Usuario } from './tipos';

type Filtro = 'TODOS' | 'ADMIN' | 'USER';

// timeZone fija a propósito — evita un mismatch de hidratación si el
// servidor (Node) y el navegador corren en zonas horarias distintas.
const formateadorFecha = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/La_Paz',
});

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'ADMIN', label: 'Administradores' },
  { id: 'USER', label: 'Usuarios de departamento' },
];

export function UsuariosExplorer() {
  const yo = useUsuarioAdmin();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  // undefined = modal cerrado; null = crear; Usuario = editar.
  const [editando, setEditando] = useState<Usuario | null | undefined>(undefined);
  const [porEliminar, setPorEliminar] = useState<Usuario | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetchAdmin('/usuarios')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelado) setUsuarios(data);
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

  const visibles = useMemo(
    () => usuarios.filter((u) => filtro === 'TODOS' || u.role === filtro),
    [usuarios, filtro],
  );

  function onGuardado(usuario: Usuario, eraNuevo: boolean) {
    setUsuarios((lista) => (eraNuevo ? [...lista, usuario] : lista.map((u) => (u.id === usuario.id ? usuario : u))));
    setEditando(undefined);
  }

  async function confirmarEliminar() {
    if (!porEliminar) return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      const res = await fetchAdmin(`/usuarios/${porEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setErrorEliminar(await mensajeDeError(res, 'No se pudo eliminar la cuenta.'));
        return;
      }
      setUsuarios((lista) => lista.filter((u) => u.id !== porEliminar.id));
      setPorEliminar(null);
    } catch {
      setErrorEliminar('No se pudo conectar con el servidor.');
    } finally {
      setEliminando(false);
    }
  }

  if (cargando) {
    return <p className="text-(--text-muted)">Cargando usuarios...</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
        No se pudieron cargar los usuarios.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              onClick={() => setFiltro(opcion.id)}
              className={`rounded-full border px-3! py-1! text-[11px] font-bold uppercase tracking-[0.06em] transition-colors duration-200 ${
                filtro === opcion.id
                  ? 'border-transparent bg-(--brand-negro) text-white'
                  : 'border-(--border) text-(--text-secondary) hover:border-(--brand-rojo)/40 hover:text-(--text-primary)'
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => setEditando(null)} className={botonPrimario}>
          + Nueva cuenta
        </button>
      </div>

      <p className="mt-4! text-sm text-(--text-muted)">
        {visibles.length} {visibles.length === 1 ? 'cuenta' : 'cuentas'}
      </p>

      {visibles.length > 0 ? (
        <div className="mt-3! overflow-x-auto rounded-2xl border border-(--border) bg-white">
          <table className="w-full min-w-180 border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-(--border) bg-(--bg-primary)">
                <th className="px-4! py-3! font-bold text-(--text-secondary)">Cuenta</th>
                <th className="px-4! py-3! font-bold text-(--text-secondary)">Rol</th>
                <th className="px-4! py-3! font-bold text-(--text-secondary)">Departamento</th>
                <th className="px-4! py-3! font-bold text-(--text-secondary)">Creada</th>
                <th className="px-4! py-3! font-bold text-(--text-secondary)" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((usuario) => {
                const esYo = usuario.id === yo.id;
                return (
                  <tr key={usuario.id} className="border-b border-(--border) last:border-0">
                    <td className="px-4! py-3!">
                      <p className="font-semibold text-(--text-primary)">
                        {usuario.name || usuario.email}
                        {esYo && <span className="ml-1.5! text-xs font-normal text-(--text-muted)">(tú)</span>}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        {usuario.email}
                        {usuario.username && ` · @${usuario.username}`}
                      </p>
                    </td>
                    <td className="px-4! py-3!">
                      <span
                        className={`inline-flex! rounded-full border px-2.5! py-0.5! text-xs font-bold whitespace-nowrap ${
                          usuario.role === 'ADMIN'
                            ? 'border-(--brand-rojo)/30 bg-(--brand-rojo)/8 text-(--brand-rojo)'
                            : 'border-(--border) text-(--text-secondary)'
                        }`}
                      >
                        {ETIQUETA_ROL[usuario.role]}
                      </span>
                    </td>
                    <td className="px-4! py-3!">
                      {usuario.departamento ? (
                        <DepartamentoBadge departamento={usuario.departamento} />
                      ) : (
                        <span className="text-(--text-muted)">{usuario.role === 'ADMIN' ? 'Todos' : 'Sin asignar'}</span>
                      )}
                    </td>
                    <td className="px-4! py-3! text-(--text-secondary)">{formateadorFecha.format(new Date(usuario.createdAt))}</td>
                    <td className="px-4! py-3!">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditando(usuario)}
                          className="rounded-full border border-(--border) px-3! py-1! text-xs font-bold text-(--text-secondary) transition-colors duration-200 hover:border-(--brand-rojo)/40 hover:text-(--text-primary)"
                        >
                          Editar
                        </button>
                        {!esYo && (
                          <button
                            type="button"
                            onClick={() => {
                              setErrorEliminar(null);
                              setPorEliminar(usuario);
                            }}
                            className={botonPeligro}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3! rounded-2xl border border-dashed border-(--border) bg-white p-10! text-center text-(--text-muted)">
          No hay cuentas en esta categoría.
        </div>
      )}

      {editando !== undefined && (
        <UsuarioModal
          usuario={editando}
          esYo={editando?.id === yo.id}
          onClose={() => setEditando(undefined)}
          onGuardado={onGuardado}
        />
      )}

      {porEliminar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4!"
          onClick={() => !eliminando && setPorEliminar(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-(--border) bg-white p-6! shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <h2 className="text-lg font-extrabold text-(--text-primary)">Eliminar cuenta</h2>
            <p className="mt-2! text-sm text-(--text-secondary)">
              Se eliminará la cuenta de <span className="font-semibold text-(--text-primary)">{porEliminar.name || porEliminar.email}</span>{' '}
              y dejará de poder entrar al panel. Esta acción no se puede deshacer.
            </p>
            {errorEliminar && <p className="mt-3! text-sm font-semibold text-[#d52b1e]">{errorEliminar}</p>}
            <div className="mt-5! flex justify-end gap-3">
              <button type="button" onClick={() => setPorEliminar(null)} disabled={eliminando} className={botonSecundario}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="rounded-full bg-[#d52b1e] px-5! py-2! text-sm font-bold text-white transition-opacity duration-200 disabled:opacity-40"
              >
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

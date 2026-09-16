'use client';

import { useState } from 'react';
import { fetchAdmin } from '@/lib/auth';
import type { TrayectoAdmin } from './tipos';
import { botonPrimario, Campo, inputClase } from './ui';

interface TrayectoFormProps {
  trayecto: TrayectoAdmin;
  onActualizado: (trayecto: TrayectoAdmin) => void;
  onEliminado: (id: string) => void;
}

export function TrayectoForm({ trayecto, onActualizado, onEliminado }: TrayectoFormProps) {
  const [nombre, setNombre] = useState(trayecto.nombre);
  const [descripcion, setDescripcion] = useState(trayecto.descripcion ?? '');
  const [imagenUrl, setImagenUrl] = useState(trayecto.imagenUrl ?? '');
  const [activo, setActivo] = useState(trayecto.activo);
  const [mostrarConteoVisitantes, setMostrarConteoVisitantes] = useState(trayecto.mostrarConteoVisitantes);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setMensajeExito(null);
    try {
      const res = await fetchAdmin(`/sellos/admin/trayectos/${trayecto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          descripcion: descripcion || null,
          imagenUrl: imagenUrl || null,
          activo,
          mostrarConteoVisitantes,
        }),
      });
      if (!res.ok) throw new Error('No se pudo guardar');
      onActualizado((await res.json()) as TrayectoAdmin);
      setMensajeExito('Cambios guardados.');
    } catch {
      setError('No se pudieron guardar los cambios. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar el trayecto "${trayecto.nombre}"? Se borrarán también sus eventos, puntos, rangos y medallas. Esta acción no se puede deshacer.`)) {
      return;
    }
    setEliminando(true);
    setError(null);
    try {
      const res = await fetchAdmin(`/sellos/admin/trayectos/${trayecto.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');
      onEliminado(trayecto.id);
    } catch {
      setError('No se pudo eliminar el trayecto. Intenta de nuevo.');
      setEliminando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="mt-6! space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo label="Nombre">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClase} required />
        </Campo>
        <Campo label="Imagen del trayecto (URL)">
          <input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} className={inputClase} />
        </Campo>
        <Campo label="Descripción" className="sm:col-span-2">
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className={inputClase} />
        </Campo>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm font-semibold text-(--text-secondary)">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="h-4 w-4" />
        Trayecto activo (visible en /sellos)
      </label>

      <label className="flex w-fit items-center gap-2 text-sm font-semibold text-(--text-secondary)">
        <input
          type="checkbox"
          checked={mostrarConteoVisitantes}
          onChange={(e) => setMostrarConteoVisitantes(e.target.checked)}
          className="h-4 w-4"
        />
        Mostrar a los visitantes cuánta gente escaneó este trayecto
      </label>

      {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}
      {mensajeExito && <p className="text-sm font-semibold text-[#2e7d46]">{mensajeExito}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2!">
        <button
          type="button"
          onClick={eliminar}
          disabled={eliminando}
          className="rounded-full border border-[#d52b1e]/40 px-5! py-2! text-sm font-bold text-[#d52b1e] transition-opacity duration-200 disabled:opacity-40"
        >
          {eliminando ? 'Eliminando...' : 'Eliminar trayecto'}
        </button>
        <button type="submit" disabled={guardando} className={botonPrimario}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

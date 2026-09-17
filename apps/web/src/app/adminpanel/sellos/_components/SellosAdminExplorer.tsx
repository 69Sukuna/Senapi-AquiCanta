'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { fetchAdmin } from '@/lib/auth';
import { TrayectoForm } from './TrayectoForm';
import { EventosTab } from './EventosTab';
import { RangosTab } from './RangosTab';
import { MedallasTab } from './MedallasTab';
import { ReportesTab } from './ReportesTab';
import { botonPrimario, botonSecundario, Campo, inputClase } from './ui';
import type { PestanaSellos, TrayectoAdmin } from './tipos';

const PESTANAS: { id: PestanaSellos; label: string }[] = [
  { id: 'trayecto', label: 'Trayecto' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'rangos', label: 'Rangos' },
  { id: 'medallas', label: 'Medallas' },
  { id: 'reportes', label: 'Reportes' },
];

export function SellosAdminExplorer() {
  const [trayectos, setTrayectos] = useState<TrayectoAdmin[] | null>(null);
  const [trayectoId, setTrayectoId] = useState<string | null>(null);
  const [pestana, setPestana] = useState<PestanaSellos>('trayecto');
  const [creandoTrayecto, setCreandoTrayecto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmin('/sellos/admin/trayectos')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: TrayectoAdmin[]) => {
        setTrayectos(data);
        if (data.length > 0) setTrayectoId(data[0].id);
      })
      .catch(() => setError('No se pudieron cargar los trayectos.'));
  }, []);

  function reemplazarTrayecto(actualizado: TrayectoAdmin) {
    setTrayectos((lista) => {
      if (!lista) return lista;
      const existe = lista.some((t) => t.id === actualizado.id);
      return existe ? lista.map((t) => (t.id === actualizado.id ? actualizado : t)) : [...lista, actualizado];
    });
    setTrayectoId(actualizado.id);
  }

  function quitarTrayecto(id: string) {
    setTrayectos((lista) => {
      const restante = (lista ?? []).filter((t) => t.id !== id);
      setTrayectoId(restante[0]?.id ?? null);
      return restante;
    });
  }

  if (error) {
    return <div className="mt-10! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">{error}</div>;
  }

  if (!trayectos) {
    return <div className="mt-10! text-center text-(--text-muted)">Cargando...</div>;
  }

  const trayectoActivo = trayectos.find((t) => t.id === trayectoId) ?? null;

  return (
    <div className="mt-10!">
      <div className="flex flex-wrap items-center gap-3">
        {trayectos.length > 0 && (
          <select
            value={trayectoId ?? ''}
            onChange={(e) => setTrayectoId(e.target.value)}
            className={`${inputClase} w-auto`}
          >
            {trayectos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} {t.activo ? '' : '(inactivo)'}
              </option>
            ))}
          </select>
        )}
        <button type="button" onClick={() => setCreandoTrayecto((v) => !v)} className={botonSecundario}>
          {creandoTrayecto ? 'Cancelar' : '+ Nuevo trayecto'}
        </button>
        {trayectoActivo && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--text-secondary)">
            <Users className="h-4 w-4" />
            {trayectoActivo.visitantesUnicos} {trayectoActivo.visitantesUnicos === 1 ? 'persona escaneó' : 'personas escanearon'} este trayecto
          </span>
        )}
      </div>

      {creandoTrayecto && (
        <FormNuevoTrayecto
          onCreado={(t) => {
            reemplazarTrayecto(t);
            setCreandoTrayecto(false);
          }}
        />
      )}

      <div className="mt-6!">
        <div className="flex gap-1 border-b border-(--border)">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPestana(p.id)}
              className={`px-4! py-2.5! text-sm font-bold transition-colors duration-200 ${
                pestana === p.id
                  ? 'border-b-2 border-[#1e63b8] text-[#1e63b8]'
                  : 'border-b-2 border-transparent text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {pestana === 'medallas' ? (
          // Medallas es global — no depende de qué trayecto esté elegido
          // arriba (o de que exista alguno siquiera).
          <MedallasTab />
        ) : pestana === 'reportes' ? (
          // Reportes agrega TODOS los trayectos — tampoco depende del
          // selector de arriba.
          <ReportesTab />
        ) : trayectoActivo ? (
          <>
            {pestana === 'trayecto' && (
              // key={trayectoActivo.id}: TrayectoForm carga nombre/descripción/etc.
              // en estado local al montarse — sin esto, cambiar de trayecto en el
              // selector de arriba dejaba el formulario mostrando los datos del
              // trayecto anterior en vez de refrescarse.
              <TrayectoForm key={trayectoActivo.id} trayecto={trayectoActivo} onActualizado={reemplazarTrayecto} onEliminado={quitarTrayecto} />
            )}
            {pestana === 'eventos' && <EventosTab trayecto={trayectoActivo} onTrayectoActualizado={reemplazarTrayecto} />}
            {pestana === 'rangos' && <RangosTab trayecto={trayectoActivo} onTrayectoActualizado={reemplazarTrayecto} />}
          </>
        ) : (
          !creandoTrayecto && (
            <div className="mt-10! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
              Todavía no hay ningún trayecto. Crea el primero con &quot;+ Nuevo trayecto&quot;.
            </div>
          )
        )}
      </div>
    </div>
  );
}

function FormNuevoTrayecto({ onCreado }: { onCreado: (t: TrayectoAdmin) => void }) {
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const res = await fetchAdmin('/sellos/admin/trayectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      if (!res.ok) throw new Error('No se pudo crear');
      onCreado((await res.json()) as TrayectoAdmin);
    } catch {
      setError('No se pudo crear el trayecto. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={crear} className="mt-4! flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-(--border) p-4!">
      <Campo label="Nombre del nuevo trayecto" className="min-w-64 flex-1">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className={inputClase} />
      </Campo>
      {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}
      <button type="submit" disabled={guardando} className={botonPrimario}>
        {guardando ? 'Creando...' : 'Crear'}
      </button>
    </form>
  );
}

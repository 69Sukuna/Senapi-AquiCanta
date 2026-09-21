'use client';

import { useState } from 'react';
import { fetchAdmin } from '@/lib/auth';
import { BotonesOrden, botonPeligro, botonPrimario, botonSecundario, Campo, inputClase, moverEnLista } from './ui';
import type { EventoAdmin, RangoAdmin, TrayectoAdmin } from './tipos';

interface RangosTabProps {
  trayecto: TrayectoAdmin;
  onTrayectoActualizado: (t: TrayectoAdmin) => void;
}

export function RangosTab({ trayecto, onTrayectoActualizado }: RangosTabProps) {
  const [creando, setCreando] = useState(false);
  const [moviendo, setMoviendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mover(indice: number, direccion: 'arriba' | 'abajo') {
    const reordenados = moverEnLista(trayecto.rangos, indice, direccion);
    if (reordenados === trayecto.rangos) return;
    onTrayectoActualizado({ ...trayecto, rangos: reordenados });
    setMoviendo(true);
    setError(null);
    try {
      const res = await fetchAdmin(`/sellos/admin/trayectos/${trayecto.id}/rangos/orden`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordenados.map((r) => r.id) }),
      });
      if (!res.ok) throw new Error();
      onTrayectoActualizado((await res.json()) as TrayectoAdmin);
    } catch {
      onTrayectoActualizado(trayecto);
      setError('No se pudo reordenar. Intenta de nuevo.');
    } finally {
      setMoviendo(false);
    }
  }

  return (
    <div className="mt-6! space-y-4">
      {trayecto.rangos.length === 0 && (
        <p className="text-sm text-(--text-muted)">Este trayecto todavía no tiene rangos.</p>
      )}

      {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}

      {trayecto.rangos.map((rango, i) => (
        <RangoRow
          key={rango.id}
          rango={rango}
          eventosDisponibles={trayecto.eventos}
          esPrimero={i === 0}
          esUltimo={i === trayecto.rangos.length - 1}
          moviendo={moviendo}
          onSubir={() => mover(i, 'arriba')}
          onBajar={() => mover(i, 'abajo')}
          onTrayectoActualizado={onTrayectoActualizado}
        />
      ))}

      {creando ? (
        <FormRango
          eventosDisponibles={trayecto.eventos}
          onGuardar={async (datos) => {
            const res = await fetchAdmin(`/sellos/admin/trayectos/${trayecto.id}/rangos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(datos),
            });
            if (!res.ok) throw new Error('No se pudo crear');
            onTrayectoActualizado((await res.json()) as TrayectoAdmin);
            setCreando(false);
          }}
          onCancelar={() => setCreando(false)}
          textoBoton="Crear rango"
        />
      ) : (
        <button type="button" onClick={() => setCreando(true)} className={botonSecundario}>
          + Nuevo rango
        </button>
      )}
    </div>
  );
}

function RangoRow({
  rango,
  eventosDisponibles,
  esPrimero,
  esUltimo,
  moviendo,
  onSubir,
  onBajar,
  onTrayectoActualizado,
}: {
  rango: RangoAdmin;
  eventosDisponibles: EventoAdmin[];
  esPrimero: boolean;
  esUltimo: boolean;
  moviendo: boolean;
  onSubir: () => void;
  onBajar: () => void;
  onTrayectoActualizado: (t: TrayectoAdmin) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function eliminar() {
    if (!window.confirm(`¿Eliminar el rango "${rango.nombre}"?`)) return;
    setEliminando(true);
    try {
      const res = await fetchAdmin(`/sellos/admin/rangos/${rango.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');
      onTrayectoActualizado((await res.json()) as TrayectoAdmin);
    } catch {
      setError('No se pudo eliminar el rango. Intenta de nuevo.');
      setEliminando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-4!">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <BotonesOrden esPrimero={esPrimero} esUltimo={esUltimo} onSubir={onSubir} onBajar={onBajar} deshabilitado={moviendo} />
          <div className="min-w-0">
            <p className="truncate font-bold text-(--text-primary)">{rango.nombre}</p>
            <p className="text-xs text-(--text-muted)">
              exige: {rango.eventos.length > 0 ? rango.eventos.map((e) => e.nombre).join(', ') : 'ningún evento'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => setEditando((v) => !v)} className={botonSecundario}>
            {editando ? 'Cerrar' : 'Editar'}
          </button>
          <button type="button" onClick={eliminar} disabled={eliminando} className={botonPeligro}>
            {eliminando ? '...' : 'Eliminar'}
          </button>
        </div>
      </div>
      {error && <p className="mt-2! text-sm font-semibold text-[#d52b1e]">{error}</p>}

      {editando && (
        <div className="mt-4! border-t border-(--border) pt-4!">
          <FormRango
            eventosDisponibles={eventosDisponibles}
            valoresIniciales={{ nombre: rango.nombre, eventoIds: rango.eventos.map((e) => e.id) }}
            onGuardar={async (datos) => {
              const res = await fetchAdmin(`/sellos/admin/rangos/${rango.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
              });
              if (!res.ok) throw new Error('No se pudo guardar');
              onTrayectoActualizado((await res.json()) as TrayectoAdmin);
              setEditando(false);
            }}
            onCancelar={() => setEditando(false)}
            textoBoton="Guardar"
          />
        </div>
      )}
    </div>
  );
}

interface FormRangoProps {
  eventosDisponibles: EventoAdmin[];
  valoresIniciales?: { nombre: string; eventoIds: string[] };
  onGuardar: (datos: { nombre: string; eventoIds: string[] }) => Promise<void>;
  onCancelar: () => void;
  textoBoton: string;
}

function FormRango({ eventosDisponibles, valoresIniciales, onGuardar, onCancelar, textoBoton }: FormRangoProps) {
  const [nombre, setNombre] = useState(valoresIniciales?.nombre ?? '');
  const [eventoIds, setEventoIds] = useState<string[]>(valoresIniciales?.eventoIds ?? []);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function alternarEvento(id: string) {
    setEventoIds((lista) => (lista.includes(id) ? lista.filter((e) => e !== id) : [...lista, id]));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({ nombre, eventoIds });
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3 rounded-2xl border border-dashed border-(--border) p-4!">
      <Campo label="Nombre del rango">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className={inputClase} />
      </Campo>

      <div>
        <p className="mb-1! text-xs font-semibold text-(--text-secondary)">Eventos que exige completados</p>
        {eventosDisponibles.length === 0 ? (
          <p className="text-sm text-(--text-muted)">Todavía no hay eventos en este trayecto.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {eventosDisponibles.map((evento) => (
              <label
                key={evento.id}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3! py-1.5! text-xs font-semibold transition-colors duration-200 ${
                  eventoIds.includes(evento.id) ? 'border-(--brand-rojo) text-(--brand-rojo)' : 'border-(--border) text-(--text-secondary)'
                }`}
              >
                <input type="checkbox" checked={eventoIds.includes(evento.id)} onChange={() => alternarEvento(evento.id)} className="h-3.5 w-3.5" />
                {evento.nombre}
              </label>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancelar} className={botonSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className={botonPrimario}>
          {guardando ? 'Guardando...' : textoBoton}
        </button>
      </div>
    </form>
  );
}

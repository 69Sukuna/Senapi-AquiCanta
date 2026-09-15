'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchAdmin } from '@/lib/auth';
import { CodigoQR } from './CodigoQR';
import { BotonesOrden, botonPeligro, botonPrimario, botonSecundario, Campo, inputClase, moverEnLista } from './ui';
import type { EventoAdmin, PuntoAdmin, TrayectoAdmin } from './tipos';

interface EventosTabProps {
  trayecto: TrayectoAdmin;
  onTrayectoActualizado: (trayecto: TrayectoAdmin) => void;
}

export function EventosTab({ trayecto, onTrayectoActualizado }: EventosTabProps) {
  const [creando, setCreando] = useState(false);
  const [moviendo, setMoviendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mover con las flechas: reordena localmente al toque (optimista) y manda
  // los ids en el orden final al backend, que renumera 1..N — así no hace
  // falta que el admin escriba un "orden" a mano.
  async function mover(indice: number, direccion: 'arriba' | 'abajo') {
    const reordenados = moverEnLista(trayecto.eventos, indice, direccion);
    if (reordenados === trayecto.eventos) return;
    onTrayectoActualizado({ ...trayecto, eventos: reordenados });
    setMoviendo(true);
    setError(null);
    try {
      const res = await fetchAdmin(`/sellos/admin/trayectos/${trayecto.id}/eventos/orden`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordenados.map((e) => e.id) }),
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
      {trayecto.eventos.length === 0 && (
        <p className="text-sm text-(--text-muted)">Este trayecto todavía no tiene eventos.</p>
      )}

      {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}

      {trayecto.eventos.map((evento, i) => (
        <EventoRow
          key={evento.id}
          evento={evento}
          esPrimero={i === 0}
          esUltimo={i === trayecto.eventos.length - 1}
          moviendo={moviendo}
          onSubir={() => mover(i, 'arriba')}
          onBajar={() => mover(i, 'abajo')}
          onTrayectoActualizado={onTrayectoActualizado}
        />
      ))}

      {creando ? (
        <FormNuevoEvento
          trayectoId={trayecto.id}
          onCreado={(t) => {
            onTrayectoActualizado(t);
            setCreando(false);
          }}
          onCancelar={() => setCreando(false)}
        />
      ) : (
        <button type="button" onClick={() => setCreando(true)} className={botonSecundario}>
          + Nuevo evento
        </button>
      )}
    </div>
  );
}

function FormNuevoEvento({
  trayectoId,
  onCreado,
  onCancelar,
}: {
  trayectoId: string;
  onCreado: (t: TrayectoAdmin) => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const res = await fetchAdmin(`/sellos/admin/trayectos/${trayectoId}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      if (!res.ok) throw new Error('No se pudo crear');
      onCreado((await res.json()) as TrayectoAdmin);
    } catch {
      setError('No se pudo crear el evento. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={crear} className="space-y-3 rounded-2xl border border-dashed border-(--border) p-4!">
      <Campo label="Nombre del evento">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className={inputClase} />
      </Campo>
      {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancelar} className={botonSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className={botonPrimario}>
          {guardando ? 'Creando...' : 'Crear evento'}
        </button>
      </div>
    </form>
  );
}

function EventoRow({
  evento,
  esPrimero,
  esUltimo,
  moviendo,
  onSubir,
  onBajar,
  onTrayectoActualizado,
}: {
  evento: EventoAdmin;
  esPrimero: boolean;
  esUltimo: boolean;
  moviendo: boolean;
  onSubir: () => void;
  onBajar: () => void;
  onTrayectoActualizado: (t: TrayectoAdmin) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(evento.nombre);
  const [creandoPunto, setCreandoPunto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const res = await fetchAdmin(`/sellos/admin/eventos/${evento.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      if (!res.ok) throw new Error('No se pudo guardar');
      onTrayectoActualizado((await res.json()) as TrayectoAdmin);
      setEditando(false);
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar el evento "${evento.nombre}"? Se borrarán también sus puntos de escaneo.`)) return;
    setEliminando(true);
    try {
      const res = await fetchAdmin(`/sellos/admin/eventos/${evento.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');
      onTrayectoActualizado((await res.json()) as TrayectoAdmin);
    } catch {
      setError('No se pudo eliminar el evento. Intenta de nuevo.');
      setEliminando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-4!">
      {/* flex-col en mobile: si el nombre + los botones no entran en una sola
          fila, mejor apilar en dos filas completas que forzar el nombre del
          evento a un ancho casi invisible tratando de que todo entre junto
          (eso pasaba antes con flex-wrap solo, porque un texto con overflow
          puede "encogerse" a casi 0 en vez de saltar de línea). */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <BotonesOrden esPrimero={esPrimero} esUltimo={esUltimo} onSubir={onSubir} onBajar={onBajar} deshabilitado={moviendo} />
          <button type="button" onClick={() => setAbierto((v) => !v)} className="flex min-w-0 items-center gap-2 text-left">
            {abierto ? <ChevronUp size={18} className="shrink-0 text-(--text-muted)" /> : <ChevronDown size={18} className="shrink-0 text-(--text-muted)" />}
            <span className="truncate font-bold text-(--text-primary)">{evento.nombre}</span>
            <span className="shrink-0 text-xs text-(--text-muted)">{evento.puntos.length} punto(s)</span>
          </button>
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

      {editando && (
        <form onSubmit={guardar} className="mt-4! space-y-3 border-t border-(--border) pt-4!">
          <Campo label="Nombre del evento">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className={inputClase} />
          </Campo>
          {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={guardando} className={botonPrimario}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {abierto && (
        <div className="mt-4! space-y-3 border-t border-(--border) pt-4!">
          {evento.puntos.length === 0 && (
            <p className="text-sm text-(--text-muted)">Este evento todavía no tiene puntos de escaneo.</p>
          )}
          {evento.puntos.map((punto) => (
            <PuntoRow key={punto.id} punto={punto} onTrayectoActualizado={onTrayectoActualizado} />
          ))}

          {creandoPunto ? (
            <FormNuevoPunto
              eventoId={evento.id}
              onCreado={(t) => {
                onTrayectoActualizado(t);
                setCreandoPunto(false);
              }}
              onCancelar={() => setCreandoPunto(false)}
            />
          ) : (
            <button type="button" onClick={() => setCreandoPunto(true)} className={botonSecundario}>
              + Nuevo punto de escaneo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function generarCodigo(): string {
  return crypto.randomUUID().slice(0, 8);
}

function FormNuevoPunto({
  eventoId,
  onCreado,
  onCancelar,
}: {
  eventoId: string;
  onCreado: (t: TrayectoAdmin) => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState(() => generarCodigo());
  const [imagenUrl, setImagenUrl] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const res = await fetchAdmin(`/sellos/admin/eventos/${eventoId}/puntos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre || null,
          codigo,
          imagenUrl: imagenUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'No se pudo crear');
      }
      onCreado((await res.json()) as TrayectoAdmin);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el punto. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={crear} className="space-y-3 rounded-2xl border border-dashed border-(--border) p-4!">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo label="Nombre del punto">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClase} />
        </Campo>
        <Campo label="Código (va en el QR)">
          <div className="flex gap-2">
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} required className={inputClase} />
            <button type="button" onClick={() => setCodigo(generarCodigo())} className={botonSecundario}>
              Generar
            </button>
          </div>
        </Campo>
        <Campo label="Imagen del sello (URL)">
          <input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} className={inputClase} />
        </Campo>
      </div>
      {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancelar} className={botonSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className={botonPrimario}>
          {guardando ? 'Creando...' : 'Crear punto'}
        </button>
      </div>
    </form>
  );
}

function PuntoRow({
  punto,
  onTrayectoActualizado,
}: {
  punto: PuntoAdmin;
  onTrayectoActualizado: (t: TrayectoAdmin) => void;
}) {
  const [editando, setEditando] = useState(false);
  // No es editable desde el panel (ver FormNuevoPunto) — se reenvía tal cual
  // para no borrar la agrupación de puntos ya sembrados (ej. "Sábado"/"Domingo").
  const instancia = punto.instancia ?? '';
  const [nombre, setNombre] = useState(punto.nombre ?? '');
  const [codigo, setCodigo] = useState(punto.codigo);
  const [imagenUrl, setImagenUrl] = useState(punto.imagenUrl ?? '');
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const res = await fetchAdmin(`/sellos/admin/puntos/${punto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instancia: instancia || null,
          nombre: nombre || null,
          codigo,
          imagenUrl: imagenUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'No se pudo guardar');
      }
      onTrayectoActualizado((await res.json()) as TrayectoAdmin);
      setEditando(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar el punto de escaneo "${punto.nombre ?? punto.codigo}"?`)) return;
    setEliminando(true);
    try {
      const res = await fetchAdmin(`/sellos/admin/puntos/${punto.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');
      onTrayectoActualizado((await res.json()) as TrayectoAdmin);
    } catch {
      setError('No se pudo eliminar el punto. Intenta de nuevo.');
      setEliminando(false);
    }
  }

  return (
    <div className="rounded-xl border border-(--border) p-3!">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <CodigoQR codigo={punto.codigo} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-(--text-primary)">{punto.nombre ?? 'Sin nombre'}</p>
            {punto.instancia && <p className="text-xs text-(--text-secondary)">Instancia: {punto.instancia}</p>}
            <p className="truncate font-mono text-xs text-(--text-muted)">código: {punto.codigo}</p>
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

      {editando && (
        <form onSubmit={guardar} className="mt-3! space-y-3 border-t border-(--border) pt-3!">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo label="Nombre del punto">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClase} />
            </Campo>
            <Campo label="Código">
              <input value={codigo} onChange={(e) => setCodigo(e.target.value)} required className={inputClase} />
            </Campo>
            <Campo label="Imagen del sello (URL)">
              <input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} className={inputClase} />
            </Campo>
          </div>
          {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={guardando} className={botonPrimario}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

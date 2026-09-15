'use client';

import { useEffect, useState } from 'react';
import { fetchAdmin } from '@/lib/auth';
import { BotonesOrden, botonPeligro, botonPrimario, botonSecundario, Campo, inputClase, moverEnLista } from './ui';
import type { MedallaAdmin } from './tipos';

// Medalla ya no cuelga de ningún trayecto (cuenta el total de sellos del
// visitante en CUALQUIER trayecto) — esta pestaña vive fuera del selector de
// trayecto de arriba, con su propio fetch y sus propias llamadas.
export function MedallasTab() {
  const [medallas, setMedallas] = useState<MedallaAdmin[] | null>(null);
  const [creando, setCreando] = useState(false);
  const [moviendo, setMoviendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmin('/sellos/admin/medallas')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: MedallaAdmin[]) => setMedallas(data))
      .catch(() => setError('No se pudieron cargar las medallas.'));
  }, []);

  function reemplazar(actualizada: MedallaAdmin) {
    setMedallas((lista) => {
      if (!lista) return lista;
      const existe = lista.some((m) => m.id === actualizada.id);
      return existe ? lista.map((m) => (m.id === actualizada.id ? actualizada : m)) : [...lista, actualizada];
    });
  }

  function quitar(id: string) {
    setMedallas((lista) => (lista ?? []).filter((m) => m.id !== id));
  }

  // Mover con las flechas: reordena localmente al toque (optimista) y manda
  // la lista completa de ids al backend, que renumera 1..N — así el "orden"
  // siempre queda secuencial sin huecos, sin que el admin escriba un número.
  async function mover(indice: number, direccion: 'arriba' | 'abajo') {
    if (!medallas) return;
    const reordenada = moverEnLista(medallas, indice, direccion);
    if (reordenada === medallas) return;
    setMedallas(reordenada);
    setMoviendo(true);
    try {
      const res = await fetchAdmin('/sellos/admin/medallas/orden', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordenada.map((m) => m.id) }),
      });
      if (!res.ok) throw new Error('No se pudo reordenar');
      setMedallas((await res.json()) as MedallaAdmin[]);
    } catch {
      setMedallas(medallas);
      setError('No se pudo reordenar. Intenta de nuevo.');
    } finally {
      setMoviendo(false);
    }
  }

  if (error) {
    return <div className="mt-6! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">{error}</div>;
  }

  if (!medallas) {
    return <div className="mt-6! text-center text-(--text-muted)">Cargando...</div>;
  }

  return (
    <div className="mt-6! space-y-4">
      <p className="rounded-xl border border-dashed border-(--border) p-3! text-xs text-(--text-muted)">
        Las medallas son globales: cuentan el total de sellos que el visitante escaneó en CUALQUIER trayecto, no de uno en
        particular. La vista pública hoy todavía usa 4 artes fijos por posición (madera / plata / oro / rubí) — el campo
        "Imagen" de acá se guarda para más adelante, cuando esa vista pase a usar el arte propio de cada medalla.
      </p>

      {medallas.length === 0 && <p className="text-sm text-(--text-muted)">Todavía no hay medallas.</p>}

      {medallas.map((medalla, i) => (
        <MedallaRow
          key={medalla.id}
          medalla={medalla}
          esPrimero={i === 0}
          esUltimo={i === medallas.length - 1}
          moviendo={moviendo}
          onSubir={() => mover(i, 'arriba')}
          onBajar={() => mover(i, 'abajo')}
          onActualizada={reemplazar}
          onEliminada={quitar}
        />
      ))}

      {creando ? (
        <FormMedalla
          onGuardar={async (datos) => {
            const res = await fetchAdmin('/sellos/admin/medallas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(datos),
            });
            if (!res.ok) throw new Error('No se pudo crear');
            reemplazar((await res.json()) as MedallaAdmin);
            setCreando(false);
          }}
          onCancelar={() => setCreando(false)}
          textoBoton="Crear medalla"
        />
      ) : (
        <button type="button" onClick={() => setCreando(true)} className={botonSecundario}>
          + Nueva medalla
        </button>
      )}
    </div>
  );
}

function MedallaRow({
  medalla,
  esPrimero,
  esUltimo,
  moviendo,
  onSubir,
  onBajar,
  onActualizada,
  onEliminada,
}: {
  medalla: MedallaAdmin;
  esPrimero: boolean;
  esUltimo: boolean;
  moviendo: boolean;
  onSubir: () => void;
  onBajar: () => void;
  onActualizada: (m: MedallaAdmin) => void;
  onEliminada: (id: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function eliminar() {
    if (!window.confirm(`¿Eliminar la medalla "${medalla.nombre}"?`)) return;
    setEliminando(true);
    try {
      const res = await fetchAdmin(`/sellos/admin/medallas/${medalla.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');
      onEliminada(medalla.id);
    } catch {
      setError('No se pudo eliminar la medalla. Intenta de nuevo.');
      setEliminando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-4!">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <BotonesOrden esPrimero={esPrimero} esUltimo={esUltimo} onSubir={onSubir} onBajar={onBajar} deshabilitado={moviendo} />
          <div className="min-w-0">
            <p className="truncate font-bold text-(--text-primary)">{medalla.nombre}</p>
            <p className="text-xs text-(--text-secondary)">{medalla.descripcion}</p>
            <p className="text-xs text-(--text-muted)">umbral {medalla.umbral} sello(s)</p>
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
          <FormMedalla
            valoresIniciales={medalla}
            onGuardar={async (datos) => {
              const res = await fetchAdmin(`/sellos/admin/medallas/${medalla.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
              });
              if (!res.ok) throw new Error('No se pudo guardar');
              onActualizada((await res.json()) as MedallaAdmin);
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

interface FormMedallaProps {
  valoresIniciales?: { nombre: string; descripcion: string; umbral: number; imagenUrl: string | null };
  onGuardar: (datos: { nombre: string; descripcion: string; umbral: number; imagenUrl: string | null }) => Promise<void>;
  onCancelar: () => void;
  textoBoton: string;
}

function FormMedalla({ valoresIniciales, onGuardar, onCancelar, textoBoton }: FormMedallaProps) {
  const [nombre, setNombre] = useState(valoresIniciales?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(valoresIniciales?.descripcion ?? '');
  const [umbral, setUmbral] = useState(String(valoresIniciales?.umbral ?? 1));
  const [imagenUrl, setImagenUrl] = useState(valoresIniciales?.imagenUrl ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({
        nombre,
        descripcion,
        umbral: Number(umbral) || 1,
        imagenUrl: imagenUrl || null,
      });
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3 rounded-2xl border border-dashed border-(--border) p-4!">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo label="Nombre">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className={inputClase} />
        </Campo>
        <Campo label="Descripción">
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required className={inputClase} />
        </Campo>
        <Campo label="Umbral (sellos necesarios)">
          <input type="number" min={1} value={umbral} onChange={(e) => setUmbral(e.target.value)} className={inputClase} />
        </Campo>
        <Campo label="Imagen (URL)">
          <input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} className={inputClase} />
        </Campo>
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

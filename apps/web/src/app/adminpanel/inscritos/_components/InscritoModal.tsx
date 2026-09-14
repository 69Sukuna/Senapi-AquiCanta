'use client';

import { useState } from 'react';
import { DEPARTAMENTOS } from '@/lib/departamentos';
import { ORDEN_ESTADOS, ESTADOS_INSCRIPCION, type EstadoInscripcion } from '@/lib/estadoInscripcion';
import { fetchAdmin } from '@/lib/auth';
import { EstadoBadge } from './EstadoBadge';
import type { Inscrito } from './tipos';

interface InscritoModalProps {
  inscrito: Inscrito;
  onClose: () => void;
  onActualizado: (actualizado: Inscrito) => void;
}

// Campos generales editables desde el panel — comunes a Cantante y Grupo.
// Los campos privados de Cantante (ciNumero, whatsapp, etc.) se editan en su
// propia sección más abajo, condicionada a tipo === 'CANTANTE'.
interface FormularioGeneral {
  nombre: string;
  pseudonimo: string;
  tituloTema: string;
  autorCompositor: string;
  ritmo: string;
  tiempo: string;
  departamento: string;
  videoUrl: string;
  fotoUrl: string;
  celular1: string;
  celular2: string;
}

interface FormularioCantante {
  ciNumero: string;
  ciExtension: string;
  fechaNacimiento: string;
  whatsapp: string;
  direccion: string;
}

function aFormularioGeneral(inscrito: Inscrito): FormularioGeneral {
  return {
    nombre: inscrito.nombre,
    pseudonimo: inscrito.pseudonimo ?? '',
    tituloTema: inscrito.tituloTema ?? '',
    autorCompositor: inscrito.autorCompositor ?? '',
    ritmo: inscrito.ritmo ?? '',
    tiempo: inscrito.tiempo ?? '',
    departamento: inscrito.departamento ?? '',
    videoUrl: inscrito.videoUrl ?? '',
    fotoUrl: inscrito.fotoUrl ?? '',
    celular1: inscrito.celular1 ?? '',
    celular2: inscrito.celular2 ?? '',
  };
}

function aFormularioCantante(inscrito: Inscrito): FormularioCantante {
  if (inscrito.tipo !== 'CANTANTE') {
    return { ciNumero: '', ciExtension: '', fechaNacimiento: '', whatsapp: '', direccion: '' };
  }
  return {
    ciNumero: inscrito.ciNumero ?? '',
    ciExtension: inscrito.ciExtension ?? '',
    fechaNacimiento: inscrito.fechaNacimiento ? inscrito.fechaNacimiento.slice(0, 10) : '',
    whatsapp: inscrito.whatsapp ?? '',
    direccion: inscrito.direccion ?? '',
  };
}

const formateadorFechaHora = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/La_Paz',
});

export function InscritoModal({ inscrito, onClose, onActualizado }: InscritoModalProps) {
  const [general, setGeneral] = useState<FormularioGeneral>(() => aFormularioGeneral(inscrito));
  const [cantanteInfo, setCantanteInfo] = useState<FormularioCantante>(() => aFormularioCantante(inscrito));
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoInscripcion>(inscrito.estado);
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const rutaTipo = inscrito.tipo === 'CANTANTE' ? 'cantante' : 'grupo';

  async function guardarDatos(e: React.FormEvent) {
    e.preventDefault();
    setGuardandoDatos(true);
    setError(null);
    setMensajeExito(null);

    const payload: Record<string, unknown> = {
      nombre: general.nombre,
      pseudonimo: general.pseudonimo || null,
      tituloTema: general.tituloTema || null,
      autorCompositor: general.autorCompositor || null,
      ritmo: general.ritmo || null,
      tiempo: general.tiempo || null,
      departamento: general.departamento || null,
      videoUrl: general.videoUrl || null,
      fotoUrl: general.fotoUrl || null,
      celular1: general.celular1 || null,
      celular2: general.celular2 || null,
    };

    if (inscrito.tipo === 'CANTANTE') {
      payload.ciNumero = cantanteInfo.ciNumero || null;
      payload.ciExtension = cantanteInfo.ciExtension || null;
      payload.whatsapp = cantanteInfo.whatsapp || null;
      payload.direccion = cantanteInfo.direccion || null;
      if (cantanteInfo.fechaNacimiento) payload.fechaNacimiento = cantanteInfo.fechaNacimiento;
    }

    try {
      const res = await fetchAdmin(`/inscripciones/${rutaTipo}/${inscrito.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('No se pudo guardar');
      const actualizado = (await res.json()) as Omit<Inscrito, 'tipo'>;
      onActualizado({ ...actualizado, tipo: inscrito.tipo } as Inscrito);
      setMensajeExito('Datos guardados.');
    } catch {
      setError('No se pudieron guardar los cambios. Intenta de nuevo.');
    } finally {
      setGuardandoDatos(false);
    }
  }

  async function guardarEstado() {
    setGuardandoEstado(true);
    setError(null);
    setMensajeExito(null);
    try {
      const res = await fetchAdmin(`/inscripciones/${rutaTipo}/${inscrito.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: estadoSeleccionado }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar el estado');
      const actualizado = (await res.json()) as Omit<Inscrito, 'tipo'>;
      onActualizado({ ...actualizado, tipo: inscrito.tipo } as Inscrito);
      setMensajeExito('Estado actualizado.');
    } catch {
      setError('No se pudo actualizar el estado. Intenta de nuevo.');
    } finally {
      setGuardandoEstado(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4!"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="glass-panel! relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6! sm:p-8!"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4! right-4! flex h-8 w-8 items-center justify-center rounded-full text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-card-hover) hover:text-(--text-primary)"
        >
          ✕
        </button>

        <span className="badge badge-gold inline-flex! w-fit">
          {inscrito.tipo === 'CANTANTE' ? 'Solista' : 'Grupo'} · {inscrito.categoria.nombre}
        </span>
        <h2 className="mt-2! text-2xl font-extrabold text-(--text-primary)">{inscrito.nombre}</h2>
        <p className="mt-1! font-mono text-xs text-(--text-muted)">
          ID: {inscrito.id} · Inscrito el {formateadorFechaHora.format(new Date(inscrito.createdAt))}
        </p>

        {/* Estado — único campo que decide qué se ve públicamente */}
        <div className="mt-5! rounded-xl border border-(--border) p-4!">
          <p className="text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">Estado de la postulación</p>
          <div className="mt-2! flex flex-wrap items-center gap-2">
            {ORDEN_ESTADOS.map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => setEstadoSeleccionado(estado)}
                className={`rounded-full border px-3! py-1.5! text-xs font-bold transition-colors duration-200 ${
                  estadoSeleccionado === estado ? '' : 'border-(--border) text-(--text-secondary) hover:text-(--text-primary)'
                }`}
                style={
                  estadoSeleccionado === estado
                    ? {
                        borderColor: ESTADOS_INSCRIPCION[estado].color,
                        backgroundColor: `${ESTADOS_INSCRIPCION[estado].color}1a`,
                        color: ESTADOS_INSCRIPCION[estado].color,
                      }
                    : undefined
                }
              >
                {ESTADOS_INSCRIPCION[estado].label}
              </button>
            ))}
          </div>
          <div className="mt-3! flex items-center gap-3">
            <button
              type="button"
              onClick={guardarEstado}
              disabled={guardandoEstado || estadoSeleccionado === inscrito.estado}
              className="rounded-full bg-[#1e63b8] px-5! py-1.5! text-xs font-bold text-white transition-opacity duration-200 disabled:opacity-40"
            >
              {guardandoEstado ? 'Guardando...' : 'Guardar estado'}
            </button>
            <span className="text-xs text-(--text-muted)">
              Actual: <EstadoBadge estado={inscrito.estado} />
            </span>
          </div>
        </div>

        {/* Datos generales editables */}
        <form onSubmit={guardarDatos} className="mt-5! space-y-4">
          <p className="text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">Datos generales</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo label="Nombre">
              <input
                value={general.nombre}
                onChange={(e) => setGeneral({ ...general, nombre: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
                required
              />
            </Campo>
            <Campo label="Pseudónimo">
              <input
                value={general.pseudonimo}
                onChange={(e) => setGeneral({ ...general, pseudonimo: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
              />
            </Campo>
            <Campo label="Título del tema">
              <input
                value={general.tituloTema}
                onChange={(e) => setGeneral({ ...general, tituloTema: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
              />
            </Campo>
            <Campo label="Autor/compositor">
              <input
                value={general.autorCompositor}
                onChange={(e) => setGeneral({ ...general, autorCompositor: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
              />
            </Campo>
            <Campo label="Ritmo">
              <input
                value={general.ritmo}
                onChange={(e) => setGeneral({ ...general, ritmo: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
              />
            </Campo>
            <Campo label="Duración">
              <input
                value={general.tiempo}
                onChange={(e) => setGeneral({ ...general, tiempo: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
              />
            </Campo>
            <Campo label="Departamento">
              <select
                value={general.departamento}
                onChange={(e) => setGeneral({ ...general, departamento: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
              >
                <option value="">Sin especificar</option>
                {Object.entries(DEPARTAMENTOS).map(([valor, info]) => (
                  <option key={valor} value={valor}>
                    {info.label}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Video (URL)">
              <input
                value={general.videoUrl}
                onChange={(e) => setGeneral({ ...general, videoUrl: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
              />
            </Campo>
            <Campo label="Foto (URL)">
              <input
                value={general.fotoUrl}
                onChange={(e) => setGeneral({ ...general, fotoUrl: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
              />
            </Campo>
            <Campo label="Celular de contacto">
              <input
                value={general.celular1}
                onChange={(e) => setGeneral({ ...general, celular1: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
              />
            </Campo>
            <Campo label="Celular alternativo">
              <input
                value={general.celular2}
                onChange={(e) => setGeneral({ ...general, celular2: e.target.value })}
                className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
              />
            </Campo>
          </div>

          {inscrito.tipo === 'CANTANTE' && (
            <>
              <p className="pt-2! text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">
                Datos personales (privados)
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Campo label="C.I.">
                  <input
                    value={cantanteInfo.ciNumero}
                    onChange={(e) => setCantanteInfo({ ...cantanteInfo, ciNumero: e.target.value })}
                    className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
                  />
                </Campo>
                <Campo label="Extensión C.I.">
                  <input
                    value={cantanteInfo.ciExtension}
                    onChange={(e) => setCantanteInfo({ ...cantanteInfo, ciExtension: e.target.value })}
                    className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
                  />
                </Campo>
                <Campo label="Fecha de nacimiento">
                  <input
                    type="date"
                    value={cantanteInfo.fechaNacimiento}
                    onChange={(e) => setCantanteInfo({ ...cantanteInfo, fechaNacimiento: e.target.value })}
                    className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
                  />
                </Campo>
                <Campo label="WhatsApp">
                  <input
                    value={cantanteInfo.whatsapp}
                    onChange={(e) => setCantanteInfo({ ...cantanteInfo, whatsapp: e.target.value })}
                    className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
                  />
                </Campo>
                <Campo label="Dirección" className="sm:col-span-2">
                  <input
                    value={cantanteInfo.direccion}
                    onChange={(e) => setCantanteInfo({ ...cantanteInfo, direccion: e.target.value })}
                    className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
                  />
                </Campo>
              </div>

              <p className="pt-2! text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">
                Carnet de identidad
              </p>
              <div className="flex flex-wrap gap-3">
                <DocLink url={inscrito.fotoCiAnversoUrl} label="Postulante — anverso" />
                <DocLink url={inscrito.fotoCiReversoUrl} label="Postulante — reverso" />
                <DocLink url={inscrito.adultoResponsableFotoCiAnversoUrl} label="Adulto responsable — anverso" />
                <DocLink url={inscrito.adultoResponsableFotoCiReversoUrl} label="Adulto responsable — reverso" />
                {!inscrito.fotoCiAnversoUrl &&
                  !inscrito.fotoCiReversoUrl &&
                  !inscrito.adultoResponsableFotoCiAnversoUrl &&
                  !inscrito.adultoResponsableFotoCiReversoUrl && (
                    <span className="text-xs text-(--text-muted)">Sin fotos de carnet cargadas.</span>
                  )}
              </div>

              {inscrito.acompanantes.length > 0 && (
                <div>
                  <p className="pt-2! text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">
                    Acompañantes ({inscrito.acompanantes.length})
                  </p>
                  <ul className="mt-2! space-y-1 text-sm text-(--text-secondary)">
                    {inscrito.acompanantes.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center gap-2">
                        <span>
                          {a.nombre}
                          {a.instrumento ? ` — ${a.instrumento}` : ''}
                        </span>
                        <DocLink url={a.fotoCiAnversoUrl} label="carnet anverso" />
                        <DocLink url={a.fotoCiReversoUrl} label="carnet reverso" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {inscrito.tipo === 'GRUPO' && (
            <>
              {inscrito.integrantes.length > 0 && (
                <div>
                  <p className="pt-2! text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">
                    Integrantes ({inscrito.integrantes.length})
                  </p>
                  <ul className="mt-2! space-y-1 text-sm text-(--text-secondary)">
                    {inscrito.integrantes.map((i) => (
                      <li key={i.id} className="flex flex-wrap items-center gap-2">
                        <span>
                          {i.nombre}
                          {i.nombreReferencia ? ` (${i.nombreReferencia})` : ''}
                          {i.instrumento ? ` — ${i.instrumento}` : ''}
                        </span>
                        <DocLink url={i.fotoCiAnversoUrl} label="carnet anverso" />
                        <DocLink url={i.fotoCiReversoUrl} label="carnet reverso" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inscrito.fotosCarnetsGrupalUrls.length > 0 && (
                <div>
                  <p className="pt-2! text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">
                    Carnets del grupo (archivo conjunto)
                  </p>
                  <div className="mt-2! flex flex-wrap gap-3">
                    {inscrito.fotosCarnetsGrupalUrls.map((url, i) => (
                      <DocLink key={url} url={url} label={`Archivo ${i + 1}`} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}
          {mensajeExito && <p className="text-sm font-semibold text-[#2e7d46]">{mensajeExito}</p>}

          <div className="flex justify-end gap-3 pt-2!">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-(--border) px-5! py-2! text-sm font-bold text-(--text-secondary) transition-colors duration-200 hover:text-(--text-primary)"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={guardandoDatos}
              className="rounded-full bg-[#1e63b8] px-5! py-2! text-sm font-bold text-white transition-opacity duration-200 disabled:opacity-40"
            >
              {guardandoDatos ? 'Guardando...' : 'Guardar datos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DocLink({ url, label }: { url: string | null; label: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-(--border) px-3! py-1! text-xs font-semibold text-[#1e63b8] transition-colors duration-200 hover:border-[#1e63b8]/40"
    >
      {label}
    </a>
  );
}

function Campo({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-semibold text-(--text-secondary) ${className ?? ''}`}>
      {label}
      {children}
    </label>
  );
}

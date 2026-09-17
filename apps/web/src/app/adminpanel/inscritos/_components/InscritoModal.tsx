'use client';

import { useState } from 'react';
import { DEPARTAMENTOS } from '@/lib/departamentos';
import { ORDEN_ESTADOS, ESTADOS_INSCRIPCION, type EstadoInscripcion } from '@/lib/estadoInscripcion';
import { fetchAdmin } from '@/lib/auth';
import { edadEnFecha } from '@/lib/edad';
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

interface FormularioAdulto {
  nombre: string;
  ciNumero: string;
  ciExtension: string;
  celular: string;
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

function aFormularioAdulto(inscrito: Inscrito): FormularioAdulto {
  if (inscrito.tipo !== 'CANTANTE') {
    return { nombre: '', ciNumero: '', ciExtension: '', celular: '' };
  }
  return {
    nombre: inscrito.adultoResponsableNombre ?? '',
    ciNumero: inscrito.adultoResponsableCiNumero ?? '',
    ciExtension: inscrito.adultoResponsableCiExtension ?? '',
    celular: inscrito.adultoResponsableCelular ?? '',
  };
}

// Edad al 10-sep-2026 (mismo corte que usa el formulario de inscripción) —
// para que el admin pueda verificar de un vistazo si el postulante cumple
// el rango de edad de su categoría, sin tener que calcularlo a mano.
function edadTexto(fechaNacimiento: string | null): string | null {
  if (!fechaNacimiento) return null;
  return `${edadEnFecha(new Date(fechaNacimiento))} años al 10-sep-2026`;
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
  const [adultoInfo, setAdultoInfo] = useState<FormularioAdulto>(() => aFormularioAdulto(inscrito));
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
      payload.adultoResponsableNombre = adultoInfo.nombre || null;
      payload.adultoResponsableCiNumero = adultoInfo.ciNumero || null;
      payload.adultoResponsableCiExtension = adultoInfo.ciExtension || null;
      payload.adultoResponsableCelular = adultoInfo.celular || null;
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
          {inscrito.tipo === 'CANTANTE' ? 'Individual' : 'Grupal'} · {inscrito.categoria.nombre}
        </span>
        <h2 className="mt-2! text-2xl font-extrabold text-(--text-primary)">{inscrito.nombre}</h2>
        <p className="mt-1! font-mono text-xs text-(--text-muted)">
          ID: {inscrito.id} · Inscrito el {formateadorFechaHora.format(new Date(inscrito.createdAt))}
        </p>
        <div className="mt-2! flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className={inscrito.aceptaBases ? 'font-semibold text-[#2e7d46]' : 'font-semibold text-[#d52b1e]'}>
            {inscrito.aceptaBases ? '✓' : '✕'} Aceptó las bases de la convocatoria
          </span>
          <span className={inscrito.declaracionVoluntaria ? 'font-semibold text-[#2e7d46]' : 'font-semibold text-[#d52b1e]'}>
            {inscrito.declaracionVoluntaria ? '✓' : '✕'} Declaración voluntaria (Anexo 3)
          </span>
        </div>

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
          <p className="text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">Datos de la obra</p>

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
          </div>

          <p className="pt-2! text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">
            Contacto y logística
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                Datos personales del postulante (privados)
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
                <Campo
                  label="Fecha de nacimiento"
                  hint={
                    edadTexto(cantanteInfo.fechaNacimiento || null)
                      ? `${edadTexto(cantanteInfo.fechaNacimiento || null)}${
                          inscrito.categoria.edadMinima != null || inscrito.categoria.edadMaxima != null
                            ? ` · categoría exige ${inscrito.categoria.edadMinima ?? '0'}–${inscrito.categoria.edadMaxima ?? '∞'} años`
                            : ''
                        }`
                      : undefined
                  }
                >
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
                Documentos del postulante
              </p>
              <div className="flex flex-wrap gap-3">
                <DocLink url={inscrito.fotoCiAnversoUrl} label="Carnet — anverso" />
                <DocLink url={inscrito.fotoCiReversoUrl} label="Carnet — reverso" />
                {inscrito.categoria.nombre === 'Ñusta' && (
                  <DocLink url={inscrito.planPromocionUrl} label="Plan de promoción (PDF)" />
                )}
                {!inscrito.fotoCiAnversoUrl &&
                  !inscrito.fotoCiReversoUrl &&
                  !(inscrito.categoria.nombre === 'Ñusta' && inscrito.planPromocionUrl) && (
                    <span className="text-xs text-(--text-muted)">Sin documentos cargados.</span>
                  )}
              </div>

              {(inscrito.categoria.requiereAdultoResponsable ||
                adultoInfo.nombre ||
                adultoInfo.ciNumero ||
                inscrito.adultoResponsableFotoCiAnversoUrl) && (
                <div className="rounded-xl border border-(--border) p-4!">
                  <p className="text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">
                    Adulto responsable (padre, madre o tutor legal)
                  </p>
                  <div className="mt-3! grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Campo label="Nombre completo" className="sm:col-span-2">
                      <input
                        value={adultoInfo.nombre}
                        onChange={(e) => setAdultoInfo({ ...adultoInfo, nombre: e.target.value })}
                        className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
                      />
                    </Campo>
                    <Campo label="C.I.">
                      <input
                        value={adultoInfo.ciNumero}
                        onChange={(e) => setAdultoInfo({ ...adultoInfo, ciNumero: e.target.value })}
                        className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
                      />
                    </Campo>
                    <Campo label="Extensión C.I.">
                      <input
                        value={adultoInfo.ciExtension}
                        onChange={(e) => setAdultoInfo({ ...adultoInfo, ciExtension: e.target.value })}
                        className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
                      />
                    </Campo>
                    <Campo label="Celular" className="sm:col-span-2">
                      <input
                        value={adultoInfo.celular}
                        onChange={(e) => setAdultoInfo({ ...adultoInfo, celular: e.target.value })}
                        className="w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
                      />
                    </Campo>
                  </div>
                  <p className="mt-3! text-xs">
                    <span
                      className={
                        inscrito.autorizaParticipacionAdultoResponsable
                          ? 'font-semibold text-[#2e7d46]'
                          : 'font-semibold text-[#d52b1e]'
                      }
                    >
                      {inscrito.autorizaParticipacionAdultoResponsable ? '✓' : '✕'} Autorizó la participación (Anexo 4)
                    </span>
                  </p>
                  <div className="mt-2! flex flex-wrap gap-3">
                    <DocLink url={inscrito.adultoResponsableFotoCiAnversoUrl} label="Carnet — anverso" />
                    <DocLink url={inscrito.adultoResponsableFotoCiReversoUrl} label="Carnet — reverso" />
                    {!inscrito.adultoResponsableFotoCiAnversoUrl && !inscrito.adultoResponsableFotoCiReversoUrl && (
                      <span className="text-xs text-(--text-muted)">Sin fotos de carnet cargadas.</span>
                    )}
                  </div>
                </div>
              )}

              {inscrito.acompanantes.length > 0 && (
                <div>
                  <p className="pt-2! text-xs font-bold tracking-[0.08em] text-(--text-secondary) uppercase">
                    Acompañantes musicales ({inscrito.acompanantes.length}
                    {inscrito.categoria.acompanantesMax ? ` / máx. ${inscrito.categoria.acompanantesMax}` : ''})
                  </p>
                  <ul className="mt-2! space-y-1.5 text-sm text-(--text-secondary)">
                    {inscrito.acompanantes.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-(--border) px-3! py-2!">
                        <span className="font-semibold text-(--text-primary)">{a.nombre}</span>
                        {a.instrumento && <span>— {a.instrumento}</span>}
                        {a.ciNumero && (
                          <span className="font-mono text-xs text-(--text-muted)">
                            C.I. {a.ciNumero}
                            {a.ciExtension ? ` ${a.ciExtension}` : ''}
                          </span>
                        )}
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
                    Integrantes ({inscrito.integrantes.length} / {inscrito.categoria.integrantesMin}–
                    {inscrito.categoria.integrantesMax})
                  </p>
                  <ul className="mt-2! space-y-1.5 text-sm text-(--text-secondary)">
                    {inscrito.integrantes.map((i) => (
                      <li key={i.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-(--border) px-3! py-2!">
                        <span className="font-semibold text-(--text-primary)">
                          {i.nombre}
                          {i.nombreReferencia ? ` (${i.nombreReferencia})` : ''}
                        </span>
                        {i.instrumento && <span>— {i.instrumento}</span>}
                        {i.ciNumero && (
                          <span className="font-mono text-xs text-(--text-muted)">
                            C.I. {i.ciNumero}
                            {i.ciExtension ? ` ${i.ciExtension}` : ''}
                          </span>
                        )}
                        {edadTexto(i.fechaNacimiento) && (
                          <span className="text-xs text-(--text-muted)">{edadTexto(i.fechaNacimiento)}</span>
                        )}
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

function Campo({
  label,
  className,
  hint,
  children,
}: {
  label: string;
  className?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-semibold text-(--text-secondary) ${className ?? ''}`}>
      {label}
      {children}
      {hint && <span className="text-[11px] font-normal text-(--text-muted)">{hint}</span>}
    </label>
  );
}

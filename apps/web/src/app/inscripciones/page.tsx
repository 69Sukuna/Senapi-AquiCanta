'use client';

import { useState } from 'react';
import {
  Award,
  Music,
  User,
  Users,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Info,
  Send,
  Sparkles,
  Download,
} from 'lucide-react';
import { generarInscripcionDocx } from '@/lib/generarInscripcionDocx';
import { GRUPOS_CATEGORIAS } from '@/lib/categorias';

// Misma agrupación que /categorias (fuente única en lib/categorias.ts),
// aquí solo se necesitan los nombres para el selector.
const GRUPOS_CATEGORIA = GRUPOS_CATEGORIAS.map((grupo) => ({
  label: grupo.label,
  items: grupo.categorias.map((categoria) => categoria.nombre),
}));

const DEPARTAMENTOS = [
  'Beni',
  'Chuquisaca',
  'Cochabamba',
  'La Paz',
  'Oruro',
  'Pando',
  'Potosí',
  'Santa Cruz',
  'Tarija',
];

const PASOS = [
  { titulo: 'Categoría', icon: Award },
  { titulo: 'La obra', icon: Music },
  { titulo: 'Postulante', icon: User },
  { titulo: 'Integrantes', icon: Users },
  { titulo: 'Declaración', icon: FileCheck },
] as const;

interface Integrante {
  id: string;
  nombre: string;
  ciNumero: string;
  ciExtension: string;
  edad: string;
  whatsapp: string;
  direccion: string;
  instrumento: string;
}

function crearIntegrante(): Integrante {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    nombre: '',
    ciNumero: '',
    ciExtension: '',
    edad: '',
    whatsapp: '',
    direccion: '',
    instrumento: '',
  };
}

// El WhatsApp/celular solo debe contener dígitos.
const soloDigitos = (valor: string) => valor.replace(/\D/g, '');
// El complemento del carnet (ej. 1A) es alfanumérico.
const soloAlfanumerico = (valor: string) => valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
// Los nombres no admiten símbolos (@, ?, etc.) y se guardan en mayúsculas.
const soloNombre = (valor: string) => valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').toUpperCase();

const inputClass =
  'w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#e0a527]/60 focus:ring-2 focus:ring-[#e0a527]/20 transition-colors';
const labelClass = 'block text-sm font-semibold text-white/80 mb-1.5';

function Campo({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-white/40 mt-1">{hint}</p>}
    </div>
  );
}

export default function InscripcionesPage() {
  const [paso, setPaso] = useState(0);
  const [pasoMaximo, setPasoMaximo] = useState(0);
  const [enviado, setEnviado] = useState(false);

  // Anexo 1 — Ficha de postulación
  const [categoria, setCategoria] = useState('');
  const [nombrePostulante, setNombrePostulante] = useState('');
  const [pseudonimo, setPseudonimo] = useState('');
  const [tituloTema, setTituloTema] = useState('');
  const [autorCompositor, setAutorCompositor] = useState('');
  const [ritmo, setRitmo] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [celular1, setCelular1] = useState('');
  const [celular2, setCelular2] = useState('');

  // Anexo 1 (tabla de firmas) + Anexo 2 (carta de presentación) — integrantes
  const [integrantes, setIntegrantes] = useState<Integrante[]>([crearIntegrante()]);

  // Anexo 1 (declaración de bases) + Anexo 3 (declaración voluntaria)
  const [aceptaBases, setAceptaBases] = useState(false);
  const [declaracionVoluntaria, setDeclaracionVoluntaria] = useState(false);

  const esComposicion = categoria === 'Composición';
  const esEspecial = categoria === 'Especial';

  const validaciones = [
    categoria !== '',
    nombrePostulante.trim() !== '' &&
      tituloTema.trim() !== '' &&
      autorCompositor.trim() !== '' &&
      ritmo.trim() !== '' &&
      tiempo.trim() !== '' &&
      (!esComposicion || pseudonimo.trim() !== ''),
    departamento !== '' && celular1.trim() !== '',
    integrantes.length > 0 &&
      integrantes.every((i) => i.nombre.trim() !== '' && i.ciNumero.trim() !== '' && i.edad.trim() !== ''),
    aceptaBases && (esEspecial || declaracionVoluntaria),
  ];

  const puedeAvanzar = validaciones[paso];

  const irAPaso = (index: number) => {
    if (index <= pasoMaximo) setPaso(index);
  };

  const siguiente = () => {
    if (!puedeAvanzar) return;
    const nuevo = Math.min(paso + 1, PASOS.length - 1);
    setPaso(nuevo);
    setPasoMaximo((m) => Math.max(m, nuevo));
  };

  const anterior = () => setPaso((p) => Math.max(p - 1, 0));

  const actualizarIntegrante = (id: string, campo: keyof Integrante, valor: string) => {
    setIntegrantes((prev) => prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  };

  const agregarIntegrante = () => {
    if (integrantes.length >= 20) return;
    setIntegrantes((prev) => [...prev, crearIntegrante()]);
  };

  const quitarIntegrante = (id: string) => {
    setIntegrantes((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  };

  const enviar = () => {
    if (!validaciones[4]) return;
    setEnviado(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reiniciarEdicion = () => setEnviado(false);

  const descargarDocx = () => {
    generarInscripcionDocx({
      categoria,
      nombrePostulante,
      pseudonimo,
      tituloTema,
      autorCompositor,
      ritmo,
      tiempo,
      departamento,
      celular1,
      celular2,
      integrantes,
      aceptaBases,
      declaracionVoluntaria,
    });
  };

  return (
    <main className="container">
      {/* Encabezado */}
      <header className="py-10 max-w-3xl">
        <span className="badge badge-gold w-fit mb-4">
          <span className="pulse-dot" /> Convocatoria 2026
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Formulario de Inscripción</h1>
        <p className="text-white/70 leading-relaxed">
          Completa los datos de tu postulación al XXXIII Festival Nacional de la Canción Boliviana
          “Aquí… Canta Bolivia”. Este formulario reúne la Ficha de Postulación, la Carta de
          Presentación y la Declaración Voluntaria de los anexos de la convocatoria.
        </p>
      </header>

      {enviado ? (
        <section className="glass-panel p-8 md:p-12 mb-16 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">¡Postulación lista!</h2>
          <p className="text-white/60 max-w-lg">
            Revisa que la categoría <strong className="text-white">{categoria}</strong> y los{' '}
            {integrantes.length} integrante{integrantes.length > 1 ? 's' : ''} registrados sean
            correctos. La conexión con el sistema de inscripciones estará disponible próximamente;
            por ahora esta es una vista previa del formulario.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={descargarDocx}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-[#007A33] shadow-md shadow-black/30 transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5 cursor-pointer"
            >
              <Download size={16} /> Descargar anexos en Word
            </button>
            <button
              onClick={reiniciarEdicion}
              className="px-6 py-3 rounded-lg font-semibold text-[#3D2B00] bg-[#F9E300] shadow-md shadow-black/30 transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5 cursor-pointer"
            >
              Editar información
            </button>
          </div>
          <p className="text-white/40 text-xs max-w-lg">
            El Word incluye la Ficha de Postulación (Anexo 1) y, por cada integrante, su propia Carta
            de Presentación (Anexo 2){categoria !== 'Especial' && ' y Declaración Voluntaria (Anexo 3)'}
            , ya que estos dos anexos son personales. Las firmas quedan en blanco para completarlas a
            mano.
          </p>
        </section>
      ) : (
        <>
          {/* Stepper */}
          <nav className="mb-8">
            <div className="hidden md:flex items-center justify-between">
              {PASOS.map((p, index) => {
                const Icon = p.icon;
                const activo = index === paso;
                const completado = index < pasoMaximo || (index === pasoMaximo && validaciones[index] && index !== paso);
                const habilitado = index <= pasoMaximo;
                return (
                  <div key={p.titulo} className="flex items-center flex-1 last:flex-none">
                    <button
                      type="button"
                      onClick={() => irAPaso(index)}
                      disabled={!habilitado}
                      className={`flex items-center gap-2.5 shrink-0 ${habilitado ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                          activo
                            ? 'bg-[#e0a527]/20 border-[#e0a527] text-[#f4c94f]'
                            : completado
                              ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-400'
                              : 'bg-black/30 border-white/10 text-white/40'
                        }`}
                      >
                        {completado && !activo ? <Check size={16} /> : <Icon size={16} />}
                      </span>
                      <span className={`text-sm font-semibold ${activo ? 'text-white' : 'text-white/50'}`}>
                        {p.titulo}
                      </span>
                    </button>
                    {index < PASOS.length - 1 && (
                      <span
                        className={`h-px flex-1 mx-3 ${index < pasoMaximo ? 'bg-emerald-400/40' : 'bg-white/10'}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Versión móvil: barra de progreso simple */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">
                  Paso {paso + 1} de {PASOS.length}: {PASOS[paso].titulo}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#f4c94f] to-[#e11d2e] transition-all duration-300"
                  style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
                />
              </div>
            </div>
          </nav>

          {/* Contenido del paso */}
          <section className="glass-panel p-6 md:p-10 mb-6">
            {/* Paso 0: Categoría */}
            {paso === 0 && (
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">¿En qué categoría postulas?</h2>
                  <p className="text-white/50 text-sm">Selecciona una sola categoría, según el Anexo 1 de la convocatoria.</p>
                </div>
                {GRUPOS_CATEGORIA.map((grupo) => (
                  <div key={grupo.label}>
                    <h3 className="text-xs font-semibold tracking-[0.15em] text-white/40 uppercase mb-3">
                      {grupo.label}
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {grupo.items.map((item) => {
                        const seleccionado = categoria === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setCategoria(item)}
                            className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                              seleccionado
                                ? 'bg-[#e0a527]/15 border-[#e0a527]/60 text-[#f4c94f]'
                                : 'bg-black/20 border-white/10 text-white/70 hover:border-white/25 hover:bg-black/30'
                            }`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                                  seleccionado ? 'border-[#f4c94f] bg-[#e0a527]' : 'border-white/30'
                                }`}
                              />
                              {item}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paso 1: La obra */}
            {paso === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Datos de la obra</h2>
                  <p className="text-white/50 text-sm">Información del tema con el que postulas.</p>
                </div>

                {esComposicion && (
                  <div className="rounded-lg border border-[#e0a527]/30 bg-[#e0a527]/10 px-4 py-3 flex gap-3 items-start">
                    <Info size={18} className="text-[#f4c94f] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#f4c94f]/90">
                      La categoría <strong>Composición</strong> requiere un pseudónimo: el jurado evalúa
                      la obra sin conocer la identidad del autor.
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  <Campo label="Nombre" required hint="Nombre del solista o de la agrupación.">
                    <input
                      className={inputClass}
                      value={nombrePostulante}
                      onChange={(e) => setNombrePostulante(soloNombre(e.target.value))}
                      placeholder="Ej: LOS KJARKAS"
                    />
                  </Campo>
                  {esComposicion && (
                    <Campo label="Pseudónimo" required hint="Solo para la categoría Composición.">
                      <input
                        className={inputClass}
                        value={pseudonimo}
                        onChange={(e) => setPseudonimo(e.target.value)}
                        placeholder="Tu pseudónimo artístico"
                      />
                    </Campo>
                  )}
                  <Campo label="Título del tema" required>
                    <input
                      className={inputClass}
                      value={tituloTema}
                      onChange={(e) => setTituloTema(e.target.value)}
                      placeholder="Ej: Illimani"
                    />
                  </Campo>
                  <Campo label="Autor / Compositor" required>
                    <input
                      className={inputClass}
                      value={autorCompositor}
                      onChange={(e) => setAutorCompositor(soloNombre(e.target.value))}
                      placeholder="NOMBRE DEL AUTOR O COMPOSITOR"
                    />
                  </Campo>
                  <Campo label="Ritmo" required>
                    <input
                      className={inputClass}
                      value={ritmo}
                      onChange={(e) => setRitmo(e.target.value)}
                      placeholder="Ej: Huayño, Cueca, Morenada..."
                    />
                  </Campo>
                  <Campo label="Duración (minutos)" required>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      className={inputClass}
                      value={tiempo}
                      onChange={(e) => setTiempo(e.target.value)}
                      placeholder="Ej: 3.5"
                    />
                  </Campo>
                </div>
              </div>
            )}

            {/* Paso 2: Postulante */}
            {paso === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Datos del postulante</h2>
                  <p className="text-white/50 text-sm">Información de contacto para coordinar tu participación.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <Campo label="Departamento" required>
                    <select
                      className={inputClass}
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                    >
                      <option value="" className="bg-[#3d0a13]">
                        Selecciona un departamento
                      </option>
                      {DEPARTAMENTOS.map((d) => (
                        <option key={d} value={d} className="bg-[#3d0a13]">
                          {d}
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <div />
                  <Campo label="Celular de contacto" required>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={8}
                      className={inputClass}
                      value={celular1}
                      onChange={(e) => setCelular1(soloDigitos(e.target.value))}
                      placeholder="Ej: 70000000"
                    />
                  </Campo>
                  <Campo label="Celular alternativo" hint="Opcional">
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={8}
                      className={inputClass}
                      value={celular2}
                      onChange={(e) => setCelular2(soloDigitos(e.target.value))}
                      placeholder="Ej: 70000000"
                    />
                  </Campo>
                </div>
              </div>
            )}

            {/* Paso 3: Integrantes */}
            {paso === 3 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Integrantes</h2>
                    <p className="text-white/50 text-sm">
                      Agrega a cada participante (hasta 20, según la ficha de postulación).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={agregarIntegrante}
                    disabled={integrantes.length >= 20}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#e0a527] hover:text-[#f4c94f] disabled:text-white/20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Plus size={16} /> Agregar integrante
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {integrantes.map((integrante, index) => (
                    <div key={integrante.id} className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-white/80">Integrante {index + 1}</span>
                        {integrantes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => quitarIntegrante(integrante.id)}
                            className="text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                            aria-label="Quitar integrante"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Campo label="Nombres y apellidos" required>
                          <input
                            className={inputClass}
                            value={integrante.nombre}
                            onChange={(e) =>
                              actualizarIntegrante(integrante.id, 'nombre', soloNombre(e.target.value))
                            }
                            placeholder="NOMBRE COMPLETO"
                          />
                        </Campo>
                        <div className="md:col-span-2">
                          <label className={labelClass}>
                            Carnet de identidad <span className="text-red-400">*</span>
                          </label>
                          <div className="flex items-end gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="block text-[11px] font-semibold uppercase tracking-wide text-white/40 mb-1">
                                Número
                              </span>
                              <input
                                type="tel"
                                inputMode="numeric"
                                className={inputClass}
                                value={integrante.ciNumero}
                                onChange={(e) =>
                                  actualizarIntegrante(integrante.id, 'ciNumero', soloDigitos(e.target.value))
                                }
                                placeholder="Ej: 1234567"
                              />
                            </div>
                            <span className="pb-2.5 text-white/30 font-bold text-lg select-none">-</span>
                            <div className="w-24 sm:w-28 shrink-0">
                              <span className="block text-[11px] font-semibold uppercase tracking-wide text-white/40 mb-1">
                                Complemento
                              </span>
                              <input
                                type="text"
                                className={`${inputClass} text-center`}
                                value={integrante.ciExtension}
                                onChange={(e) =>
                                  actualizarIntegrante(integrante.id, 'ciExtension', soloAlfanumerico(e.target.value))
                                }
                                placeholder="1A"
                                maxLength={4}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-white/40 mt-1">
                            El complemento es opcional: código alfanumérico que va después del guion, ej. 123456-1A.
                          </p>
                        </div>
                        <Campo label="Edad" required>
                          <input
                            type="number"
                            min={0}
                            className={inputClass}
                            value={integrante.edad}
                            onChange={(e) => actualizarIntegrante(integrante.id, 'edad', e.target.value)}
                            placeholder="Años"
                          />
                        </Campo>
                        <Campo label="WhatsApp">
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={8}
                            className={inputClass}
                            value={integrante.whatsapp}
                            onChange={(e) =>
                              actualizarIntegrante(integrante.id, 'whatsapp', soloDigitos(e.target.value))
                            }
                            placeholder="Ej: 70000000"
                          />
                        </Campo>
                        <Campo label="Dirección actual">
                          <input
                            className={inputClass}
                            value={integrante.direccion}
                            onChange={(e) => actualizarIntegrante(integrante.id, 'direccion', e.target.value)}
                            placeholder="Zona / calle / ciudad"
                          />
                        </Campo>
                        <Campo label="Instrumento(s) a ejecutar" hint="Si aplica">
                          <input
                            className={inputClass}
                            value={integrante.instrumento}
                            onChange={(e) => actualizarIntegrante(integrante.id, 'instrumento', e.target.value)}
                            placeholder="Ej: Charango, guitarra..."
                          />
                        </Campo>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 4: Declaraciones */}
            {paso === 4 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Declaraciones finales</h2>
                  <p className="text-white/50 text-sm">
                    Estas declaraciones equivalen a la Carta de Presentación y la Declaración
                    Voluntaria de los anexos de la convocatoria.
                  </p>
                </div>

                <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/20 p-4 cursor-pointer hover:border-white/25 transition-colors">
                  <input
                    type="checkbox"
                    checked={aceptaBases}
                    onChange={(e) => setAceptaBases(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#e0a527] shrink-0 cursor-pointer"
                  />
                  <span className="text-sm text-white/80">
                    Declaro y acepto expresamente las bases y condiciones de la convocatoria del
                    XXXIII Festival Nacional de la Canción Boliviana “Aquí… Canta Bolivia”.{' '}
                    <span className="text-red-400">*</span>
                  </span>
                </label>

                {!esEspecial && (
                  <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/20 p-4 cursor-pointer hover:border-white/25 transition-colors">
                    <input
                      type="checkbox"
                      checked={declaracionVoluntaria}
                      onChange={(e) => setDeclaracionVoluntaria(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-[#e0a527] shrink-0 cursor-pointer"
                    />
                    <span className="text-sm text-white/80">
                      Declaro de manera voluntaria que no fui, ni actualmente soy, miembro de una
                      agrupación musical profesional. <span className="text-red-400">*</span>
                    </span>
                  </label>
                )}

                <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                    <Sparkles size={15} className="text-[#e0a527]" /> Resumen de tu postulación
                  </h3>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-white/40">Nombre</dt>
                      <dd className="text-white/80 font-medium">{nombrePostulante || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-white/40">Categoría</dt>
                      <dd className="text-white/80 font-medium">{categoria || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-white/40">Tema</dt>
                      <dd className="text-white/80 font-medium">{tituloTema || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-white/40">Departamento</dt>
                      <dd className="text-white/80 font-medium">{departamento || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-white/40">Integrantes</dt>
                      <dd className="text-white/80 font-medium">{integrantes.length}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </section>

          {/* Navegación */}
          <div className="flex items-center justify-between mb-16">
            <button
              type="button"
              onClick={anterior}
              disabled={paso === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold text-white/70 border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            {paso < PASOS.length - 1 ? (
              <button
                type="button"
                onClick={siguiente}
                disabled={!puedeAvanzar}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg font-semibold text-[#3D2B00] bg-[#F9E300] shadow-md shadow-black/30 transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={enviar}
                disabled={!puedeAvanzar}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg font-semibold text-white bg-[#007A33] shadow-md shadow-black/30 transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                <Send size={16} /> Enviar inscripción
              </button>
            )}
          </div>
        </>
      )}
    </main>
  );
}

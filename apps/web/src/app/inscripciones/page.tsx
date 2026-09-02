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
  Link as LinkIcon,
} from 'lucide-react';
import { generarInscripcionDocx } from '@/lib/generarInscripcionDocx';
import { GRUPOS_CATEGORIAS, esCategoriaGrupal } from '@/lib/categorias';
import { DEPARTAMENTOS, type DepartamentoValue } from '@/lib/departamentos';

// Misma agrupación que /categorias (fuente única en lib/categorias.ts).
const GRUPOS_CATEGORIA = GRUPOS_CATEGORIAS.map((grupo) => ({
  label: grupo.label,
  items: grupo.categorias,
}));

const LISTA_DEPARTAMENTOS = Object.entries(DEPARTAMENTOS) as [DepartamentoValue, (typeof DEPARTAMENTOS)[DepartamentoValue]][];

function codigoDepartamento(label: string): DepartamentoValue | null {
  const entrada = LISTA_DEPARTAMENTOS.find(([, info]) => info.label === label);
  return entrada ? entrada[0] : null;
}

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

// El enlace al video debe ser una URL http(s) válida (YouTube, Drive, etc.).
function esUrlValida(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Panel de contenido del formulario: tarjeta blanca con una fina cinta
// tricolor arriba, mismo detalle que Navbar/Footer, marcando cada paso.
const panelClass =
  'relative overflow-hidden rounded-2xl border border-(--border) bg-white shadow-[0_1px_2px_rgba(27,42,74,0.06),0_10px_24px_-12px_rgba(27,42,74,0.14)]';

function TelonDecor() {
  return (
    <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />
  );
}

const inputClass =
  'w-full rounded-lg bg-(--bg-primary) border border-(--border) px-4! py-2.5! text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-[#1e63b8]/60 focus:ring-2! focus:ring-[#1e63b8]/15 focus:bg-white transition-colors';
const labelClass = 'block text-sm font-semibold text-(--text-secondary) mb-2!';

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
        {label} {required && <span className="text-[#d52b1e]">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-(--text-muted) mt-1.5!">{hint}</p>}
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
  const [videoUrl, setVideoUrl] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [celular1, setCelular1] = useState('');
  const [celular2, setCelular2] = useState('');

  // Anexo 1 (tabla de firmas) + Anexo 2 (carta de presentación) — integrantes
  const [integrantes, setIntegrantes] = useState<Integrante[]>([crearIntegrante()]);

  // Anexo 1 (declaración de bases) + Anexo 3 (declaración voluntaria)
  const [aceptaBases, setAceptaBases] = useState(false);
  const [declaracionVoluntaria, setDeclaracionVoluntaria] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const esComposicion = categoria === 'Composición';
  const esEspecial = categoria === 'Especial';
  const esGrupal = esCategoriaGrupal(categoria);
  const maxIntegrantes = esGrupal ? 20 : 1;

  const validaciones = [
    categoria !== '',
    nombrePostulante.trim() !== '' &&
      tituloTema.trim() !== '' &&
      autorCompositor.trim() !== '' &&
      ritmo.trim() !== '' &&
      tiempo.trim() !== '' &&
      esUrlValida(videoUrl) &&
      (!esComposicion || pseudonimo.trim() !== ''),
    departamento !== '' && celular1.trim() !== '',
    integrantes.length > 0 &&
      integrantes.length <= maxIntegrantes &&
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

  const seleccionarCategoria = (nombre: string) => {
    setCategoria(nombre);
    // Si se cambia a una categoría individual, solo puede haber 1 integrante.
    if (!esCategoriaGrupal(nombre)) {
      setIntegrantes((prev) => (prev.length > 1 ? [prev[0]] : prev));
    }
  };

  const actualizarIntegrante = (id: string, campo: keyof Integrante, valor: string) => {
    setIntegrantes((prev) => prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  };

  const agregarIntegrante = () => {
    if (integrantes.length >= maxIntegrantes) return;
    setIntegrantes((prev) => [...prev, crearIntegrante()]);
  };

  const quitarIntegrante = (id: string) => {
    setIntegrantes((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  };

  const enviar = async () => {
    if (!validaciones[4] || enviando) return;

    setEnviando(true);
    setErrorEnvio('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/inscripciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria,
          nombrePostulante,
          pseudonimo: esComposicion ? pseudonimo : undefined,
          tituloTema,
          autorCompositor,
          ritmo,
          tiempo,
          videoUrl,
          departamento: codigoDepartamento(departamento),
          celular1,
          celular2: celular2 || undefined,
          integrantes: integrantes.map(({ nombre, ciNumero, ciExtension, edad, whatsapp, direccion, instrumento }) => ({
            nombre,
            ciNumero,
            ciExtension: ciExtension || undefined,
            edad,
            whatsapp: whatsapp || undefined,
            direccion: direccion || undefined,
            instrumento: instrumento || undefined,
          })),
          aceptaBases,
          declaracionVoluntaria,
        }),
      });

      if (!res.ok) throw new Error(`La API respondió ${res.status}`);

      setEnviado(true);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorEnvio('No pudimos enviar tu inscripción. Verifica tu conexión e inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
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
      videoUrl,
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
      <header className="pt-10! pb-10! md:pt-14! md:pb-12! max-w-3xl">
        <span className="badge badge-gold w-fit mb-4!">
          <span className="pulse-dot" /> Convocatoria 2026
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-(--text-primary) mb-3!">Formulario de Inscripción</h1>
        <p className="text-(--text-secondary) leading-relaxed">
          Completa los datos de tu postulación al XXXIII Festival Nacional de la Canción Boliviana
          “Aquí… Canta Bolivia”. Este formulario reúne la Ficha de Postulación, la Carta de
          Presentación y la Declaración Voluntaria de los anexos de la convocatoria.
        </p>
      </header>

      {enviado ? (
        <section className={`${panelClass} p-8! md:p-12! mb-16! flex flex-col items-center text-center gap-4`}>
          <TelonDecor />
          <div className="w-16 h-16 rounded-full bg-[#2e7d46]/12 border border-[#2e7d46]/35 flex items-center justify-center text-[#2e7d46]">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-bold text-(--text-primary)">¡Postulación enviada!</h2>
          <p className="text-(--text-secondary) max-w-lg">
            Tu inscripción a la categoría <strong className="text-(--text-primary)">{categoria}</strong> con{' '}
            {integrantes.length} integrante{integrantes.length > 1 ? 's' : ''} quedó registrada y
            está pendiente de revisión por el comité organizador. Guarda una copia de los anexos
            para presentarlos firmados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4!">
            <button
              onClick={descargarDocx}
              className="inline-flex items-center gap-2 px-6! py-3! rounded-lg font-semibold text-white bg-[#d52b1e] shadow-md shadow-[#d52b1e]/25 transition-all duration-300 hover:bg-[#b82419] hover:-translate-y-0.5 cursor-pointer"
            >
              <Download size={16} /> Descargar anexos en Word
            </button>
            <button
              onClick={reiniciarEdicion}
              className="px-6! py-3! rounded-lg font-semibold text-(--text-primary) border border-(--border) bg-white transition-all duration-300 hover:border-[#1e63b8]/40 hover:bg-[#1e63b8]/5 hover:-translate-y-0.5 cursor-pointer"
            >
              Editar información
            </button>
          </div>
          <p className="text-(--text-muted) text-xs max-w-lg">
            El Word incluye la Ficha de Postulación (Anexo 1) y, por cada integrante, su propia Carta
            de Presentación (Anexo 2){categoria !== 'Especial' && ' y Declaración Voluntaria (Anexo 3)'}
            , ya que estos dos anexos son personales. Las firmas quedan en blanco para completarlas a
            mano.
          </p>
        </section>
      ) : (
        <>
          {/* Stepper */}
          <nav className="mb-8!">
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
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                          activo
                            ? 'bg-[#1e63b8]/12 border-[#1e63b8] text-[#1e63b8] shadow-[0_0_0_4px_rgba(30,99,184,0.12)]'
                            : completado
                              ? 'bg-[#2e7d46]/12 border-[#2e7d46]/50 text-[#2e7d46]'
                              : 'bg-[#1b2a4a]/4 border-(--border) text-(--text-muted)'
                        }`}
                      >
                        {completado && !activo ? <Check size={16} /> : <Icon size={16} />}
                      </span>
                      <span className={`text-sm font-semibold ${activo ? 'text-(--text-primary)' : 'text-(--text-secondary)'}`}>
                        {p.titulo}
                      </span>
                    </button>
                    {index < PASOS.length - 1 && (
                      <span
                        className={`h-px flex-1 mx-3! ${index < pasoMaximo ? 'bg-[#2e7d46]/40' : 'bg-(--border)'}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Versión móvil: barra de progreso simple */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-2!">
                <span className="text-sm font-semibold text-(--text-primary)">
                  Paso {paso + 1} de {PASOS.length}: {PASOS[paso].titulo}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-(--border) overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#1e63b8] to-[#d52b1e] transition-all duration-300"
                  style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
                />
              </div>
            </div>
          </nav>

          {/* Contenido del paso — panel de telón, a juego con el fondo del sitio */}
          <section className={`${panelClass} p-6! sm:p-8! md:p-12! mb-6!`}>
            <TelonDecor />
            {/* Paso 0: Categoría */}
            {paso === 0 && (
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-xl font-bold text-(--text-primary) mb-1!">¿En qué categoría postulas?</h2>
                  <p className="text-(--text-secondary) text-sm">Selecciona una sola categoría, según el Anexo 1 de la convocatoria.</p>
                </div>
                {GRUPOS_CATEGORIA.map((grupo) => (
                  <div key={grupo.label}>
                    <h3 className="text-xs font-semibold tracking-[0.15em] text-(--text-muted) uppercase mb-3!">
                      {grupo.label}
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {grupo.items.map((item) => {
                        const seleccionado = categoria === item.nombre;
                        return (
                          <button
                            key={item.nombre}
                            type="button"
                            onClick={() => seleccionarCategoria(item.nombre)}
                            className={`text-left px-4! py-3! rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                              seleccionado
                                ? 'bg-[#1e63b8]/10 border-[#1e63b8]/60 text-[#164a8c] shadow-[0_0_0_3px_rgba(30,99,184,0.12)]'
                                : 'bg-(--bg-primary) border-(--border) text-(--text-secondary) hover:border-[#1e63b8]/35 hover:bg-[#1e63b8]/5'
                            }`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                                  seleccionado ? 'border-[#1e63b8] bg-[#1e63b8]' : 'border-(--border)'
                                }`}
                              />
                              {item.nombre}
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
                  <h2 className="text-xl font-bold text-(--text-primary) mb-1!">Datos de la obra</h2>
                  <p className="text-(--text-secondary) text-sm">Información del tema con el que postulas.</p>
                </div>

                {esComposicion && (
                  <div className="rounded-lg border border-[#1e63b8]/25 bg-[#1e63b8]/8 px-4! py-3! flex gap-3 items-start">
                    <Info size={18} className="text-[#1e63b8] shrink-0 mt-0.5!" />
                    <p className="text-sm text-[#164a8c]">
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
                  <div className="md:col-span-2">
                    <Campo
                      label="Enlace al video"
                      required
                      hint="Subí tu video a YouTube, Google Drive u otro servicio y pegá acá el enlace público."
                    >
                      <div className="relative">
                        <LinkIcon
                          size={16}
                          className="pointer-events-none absolute top-1/2 left-3! -translate-y-1/2 text-(--text-muted)"
                        />
                        <input
                          type="url"
                          className={`${inputClass} pl-9!`}
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </Campo>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Postulante */}
            {paso === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-(--text-primary) mb-1!">Datos del postulante</h2>
                  <p className="text-(--text-secondary) text-sm">Información de contacto para coordinar tu participación.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <Campo label="Departamento" required>
                    <select
                      className={inputClass}
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                    >
                      <option value="" className="bg-white text-(--text-primary)">
                        Selecciona un departamento
                      </option>
                      {LISTA_DEPARTAMENTOS.map(([codigo, info]) => (
                        <option key={codigo} value={info.label} className="bg-white text-(--text-primary)">
                          {info.label}
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
                    <h2 className="text-xl font-bold text-(--text-primary) mb-1!">
                      {esGrupal ? 'Integrantes' : 'Datos del postulante'}
                    </h2>
                    <p className="text-(--text-secondary) text-sm">
                      {esGrupal
                        ? 'Agrega a cada participante (hasta 20, según la ficha de postulación).'
                        : 'Datos personales de quien postula, para la ficha de inscripción.'}
                    </p>
                  </div>
                  {esGrupal && (
                    <button
                      type="button"
                      onClick={agregarIntegrante}
                      disabled={integrantes.length >= maxIntegrantes}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e63b8] hover:text-[#164a8c] disabled:text-(--text-muted) disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Plus size={16} /> Agregar integrante
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  {integrantes.map((integrante, index) => (
                    <div key={integrante.id} className="rounded-xl border border-(--border) bg-(--bg-primary) p-5!">
                      <div className="flex items-center justify-between mb-4!">
                        <span className="text-sm font-bold text-(--text-secondary)">Integrante {index + 1}</span>
                        {integrantes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => quitarIntegrante(integrante.id)}
                            className="text-(--text-muted) hover:text-[#d52b1e] transition-colors cursor-pointer"
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
                            Carnet de identidad <span className="text-[#d52b1e]">*</span>
                          </label>
                          <div className="flex items-end gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="block text-[11px] font-semibold uppercase tracking-wide text-(--text-muted) mb-1!">
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
                            <span className="pb-2.5! text-(--text-muted) font-bold text-lg select-none">-</span>
                            <div className="w-24 sm:w-28 shrink-0">
                              <span className="block text-[11px] font-semibold uppercase tracking-wide text-(--text-muted) mb-1!">
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
                          <p className="text-xs text-(--text-muted) mt-1!">
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
                  <h2 className="text-xl font-bold text-(--text-primary) mb-1!">Declaraciones finales</h2>
                  <p className="text-(--text-secondary) text-sm">
                    Estas declaraciones equivalen a la Carta de Presentación y la Declaración
                    Voluntaria de los anexos de la convocatoria.
                  </p>
                </div>

                <label className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--bg-primary) p-4! cursor-pointer hover:border-[#1e63b8]/35 transition-colors">
                  <input
                    type="checkbox"
                    checked={aceptaBases}
                    onChange={(e) => setAceptaBases(e.target.checked)}
                    className="mt-1! w-4 h-4 accent-[#1e63b8] shrink-0 cursor-pointer"
                  />
                  <span className="text-sm text-(--text-secondary)">
                    Declaro y acepto expresamente las bases y condiciones de la convocatoria del
                    XXXIII Festival Nacional de la Canción Boliviana “Aquí… Canta Bolivia”.{' '}
                    <span className="text-[#d52b1e]">*</span>
                  </span>
                </label>

                {!esEspecial && (
                  <label className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--bg-primary) p-4! cursor-pointer hover:border-[#1e63b8]/35 transition-colors">
                    <input
                      type="checkbox"
                      checked={declaracionVoluntaria}
                      onChange={(e) => setDeclaracionVoluntaria(e.target.checked)}
                      className="mt-1! w-4 h-4 accent-[#1e63b8] shrink-0 cursor-pointer"
                    />
                    <span className="text-sm text-(--text-secondary)">
                      Declaro de manera voluntaria que no fui, ni actualmente soy, miembro de una
                      agrupación musical profesional. <span className="text-[#d52b1e]">*</span>
                    </span>
                  </label>
                )}

                <div className="rounded-xl border border-(--border) bg-(--bg-primary) p-5!">
                  <h3 className="text-sm font-bold text-(--text-secondary) mb-3! flex items-center gap-2">
                    <Sparkles size={15} className="text-[#1e63b8]" /> Resumen de tu postulación
                  </h3>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Nombre</dt>
                      <dd className="text-(--text-primary) font-medium">{nombrePostulante || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Categoría</dt>
                      <dd className="text-(--text-primary) font-medium">{categoria || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Tema</dt>
                      <dd className="text-(--text-primary) font-medium">{tituloTema || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Video</dt>
                      <dd className="text-(--text-primary) font-medium truncate max-w-50">{videoUrl || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Departamento</dt>
                      <dd className="text-(--text-primary) font-medium">{departamento || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Integrantes</dt>
                      <dd className="text-(--text-primary) font-medium">{integrantes.length}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </section>

          {errorEnvio && (
            <div className="mb-6! rounded-lg border border-[#d52b1e]/30 bg-[#d52b1e]/8 px-4! py-3! text-sm text-[#b82419]">
              {errorEnvio}
            </div>
          )}

          {/* Navegación */}
          <div className="flex items-center justify-between mb-16!">
            <button
              type="button"
              onClick={anterior}
              disabled={paso === 0}
              className="inline-flex items-center gap-1.5 px-5! py-2.5! rounded-lg font-semibold text-(--text-secondary) border border-(--border) hover:bg-[#1b2a4a]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            {paso < PASOS.length - 1 ? (
              <button
                type="button"
                onClick={siguiente}
                disabled={!puedeAvanzar}
                className="inline-flex items-center gap-1.5 px-6! py-3! rounded-lg font-semibold text-white bg-[#d52b1e] shadow-md shadow-[#d52b1e]/25 transition-all duration-300 hover:bg-[#b82419] hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={enviar}
                disabled={!puedeAvanzar || enviando}
                className="inline-flex items-center gap-1.5 px-6! py-3! rounded-lg font-semibold text-white bg-[#d52b1e] shadow-md shadow-[#d52b1e]/25 transition-all duration-300 hover:bg-[#b82419] hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                <Send size={16} /> {enviando ? 'Enviando…' : 'Enviar inscripción'}
              </button>
            )}
          </div>
        </>
      )}
    </main>
  );
}

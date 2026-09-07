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
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Info,
  Send,
  Sparkles,
  Download,
  PlayCircle,
  CalendarDays,
  Gift,
  ShieldAlert,
  ListMusic,
  ArrowRight,
  FileDown,
  FileText,
} from 'lucide-react';
import { generarInscripcionDocx } from '@/lib/generarInscripcionDocx';
import { GRUPOS_CATEGORIAS, obtenerCategoriaInfo } from '@/lib/categorias';
import { DEPARTAMENTOS, type DepartamentoValue } from '@/lib/departamentos';
import { cumpleRangoEdad } from '@/lib/edad';
import { panelClass, TelonDecor } from './ui';

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

// TODO: pegar acá el link de Drive del PDF de la convocatoria cuando esté listo.
const CONVOCATORIA_URL = '';

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
  fechaNacimiento: string;
  whatsapp: string;
  direccion: string;
  instrumento: string;
}

function crearId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function crearIntegrante(): Integrante {
  return {
    id: crearId(),
    nombre: '',
    ciNumero: '',
    ciExtension: '',
    fechaNacimiento: '',
    whatsapp: '',
    direccion: '',
    instrumento: '',
  };
}

// Músico de acompañamiento (categorías individuales que lo permiten) — la
// convocatoria solo pide su nombre, C.I. e instrumento, nada más.
interface Acompanante {
  id: string;
  nombre: string;
  ciNumero: string;
  ciExtension: string;
  instrumento: string;
}

function crearAcompanante(): Acompanante {
  return { id: crearId(), nombre: '', ciNumero: '', ciExtension: '', instrumento: '' };
}

// El WhatsApp/celular solo debe contener dígitos.
const soloDigitos = (valor: string) => valor.replace(/\D/g, '');
// El complemento del carnet (ej. 1A) es alfanumérico.
const soloAlfanumerico = (valor: string) => valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
// Los nombres no admiten símbolos (@, ?, etc.) y se guardan en mayúsculas.
const soloNombre = (valor: string) => valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').toUpperCase();

function ciCompletoTexto(numero: string, extension: string) {
  return numero.trim() ? `${numero.trim()}${extension.trim() ? `-${extension.trim()}` : ''}` : '—';
}

function fechaLegible(iso: string) {
  if (!iso) return '—';
  const fecha = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return '—';
  return new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(fecha);
}

const inputClass =
  'w-full rounded-lg bg-(--bg-primary) border border-(--border) px-4! py-2.5! text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-[#1e63b8]/60 focus:ring-2! focus:ring-[#1e63b8]/15 focus:bg-white transition-colors';
const labelClass = 'block text-sm font-semibold text-(--text-secondary) mb-2!';

function Campo({
  label,
  required,
  children,
  hint,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  // Cuando hay error, resalta cualquier input/select/textarea dentro del
  // campo con borde rojo y muestra el mensaje en vez del hint.
  error?: string;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-[#d52b1e]">*</span>}
      </label>
      <div
        className={
          error
            ? '[&_input]:border-[#d52b1e] [&_input]:bg-[#d52b1e]/5 [&_select]:border-[#d52b1e] [&_select]:bg-[#d52b1e]/5'
            : undefined
        }
      >
        {children}
      </div>
      {error ? (
        <p className="text-xs text-[#d52b1e] font-medium mt-1.5!">{error}</p>
      ) : (
        hint && <p className="text-xs text-(--text-muted) mt-1.5!">{hint}</p>
      )}
    </div>
  );
}

export default function FormularioInscripcion() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
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

  // Músicos de acompañamiento (categorías individuales que lo permiten)
  const [acompanantes, setAcompanantes] = useState<Acompanante[]>([]);

  // Adulto responsable (padre/madre/tutor) — solo categorías infantiles
  const [adultoResponsableNombre, setAdultoResponsableNombre] = useState('');
  const [adultoResponsableCiNumero, setAdultoResponsableCiNumero] = useState('');
  const [adultoResponsableCiExtension, setAdultoResponsableCiExtension] = useState('');
  const [adultoResponsableCelular, setAdultoResponsableCelular] = useState('');
  // Aceptación digital de los términos del Anexo 4 (carta de autorización de
  // participación) — no hay una carta firmada, pero sí queda la declaración.
  const [autorizaAdultoResponsable, setAutorizaAdultoResponsable] = useState(false);

  // Anexo 1 (declaración de bases) + Anexo 3 (declaración voluntaria)
  const [aceptaBases, setAceptaBases] = useState(false);
  const [declaracionVoluntaria, setDeclaracionVoluntaria] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  // Una vez que se intenta avanzar/enviar con algo inválido, se resaltan los
  // campos con error en vez de solo bloquear el botón sin explicación.
  const [mostrarErrores, setMostrarErrores] = useState(false);

  const esComposicion = categoria === 'Composición';
  const esEspecial = categoria === 'Especial';
  // Composición y Especial son las únicas categorías donde la convocatoria
  // permite postulantes profesionales: el Anexo 3 no lleva la declaración de
  // "no soy profesional" para ellas, sino la de exención de plagio/propiedad
  // (que igual exige una declaración — solo cambia el texto, no se omite el
  // checkbox).
  const esExentoProfesional = esEspecial || esComposicion;

  const categoriaInfo = obtenerCategoriaInfo(categoria);
  const integrantesMin = categoriaInfo?.integrantesMin ?? 1;
  const integrantesMax = categoriaInfo?.integrantesMax ?? 1;
  const acompanantesMax = categoriaInfo?.acompanantesMax ?? 0;
  const edadMinima = categoriaInfo?.edadMinima ?? null;
  const edadMaxima = categoriaInfo?.edadMaxima ?? null;
  const requiereAdultoResponsable = categoriaInfo?.requiereAdultoResponsable ?? false;
  const esGrupal = integrantesMax > 1;
  const rangoIntegrantesTexto =
    integrantesMin === integrantesMax ? `exactamente ${integrantesMin}` : `entre ${integrantesMin} y ${integrantesMax}`;
  const rangoEdadTexto =
    edadMinima != null && edadMaxima != null
      ? `entre ${edadMinima} y ${edadMaxima} años`
      : edadMinima != null
        ? `al menos ${edadMinima} años`
        : edadMaxima != null
          ? `como máximo ${edadMaxima} años`
          : null;
  const duracionMaxima = categoriaInfo?.duracionMaximaMinutos ?? 5;
  const duracionExcedida = tiempo.trim() !== '' && Number(tiempo) > duracionMaxima;

  const validaciones = [
    categoria !== '',
    nombrePostulante.trim() !== '' &&
      tituloTema.trim() !== '' &&
      autorCompositor.trim() !== '' &&
      ritmo.trim() !== '' &&
      tiempo.trim() !== '' &&
      !duracionExcedida &&
      (!esComposicion || pseudonimo.trim() !== ''),
    departamento !== '' && celular1.trim() !== '',
    integrantes.length >= integrantesMin &&
      integrantes.length <= integrantesMax &&
      integrantes.every(
        (i) =>
          i.nombre.trim() !== '' &&
          i.ciNumero.trim() !== '' &&
          i.fechaNacimiento.trim() !== '' &&
          (edadMinima == null && edadMaxima == null ? true : cumpleRangoEdad(i.fechaNacimiento, edadMinima, edadMaxima)),
      ) &&
      acompanantes.length <= acompanantesMax &&
      acompanantes.every((a) => a.nombre.trim() !== '' && a.ciNumero.trim() !== '') &&
      (!requiereAdultoResponsable ||
        (adultoResponsableNombre.trim() !== '' &&
          adultoResponsableCiNumero.trim() !== '' &&
          adultoResponsableCelular.trim() !== '')),
    aceptaBases && declaracionVoluntaria && (!requiereAdultoResponsable || autorizaAdultoResponsable),
  ];

  const puedeAvanzar = validaciones[paso];
  // No basta con que el paso actual esté ok: si el usuario vuelve a un paso
  // anterior con el stepper y deja algo inválido, "pasoMaximo" ya había
  // llegado al final y el botón de enviar quedaría habilitado igual. Por
  // eso el envío exige que TODOS los pasos sigan siendo válidos.
  const formularioCompleto = validaciones.every(Boolean);

  // Lista completa de lo que falta o está mal en el paso actual — se muestra
  // debajo del formulario además del resaltado en cada campo, para que no
  // haya que ir buscando uno por uno qué falta.
  const erroresPasoActual: string[] = [];
  if (paso === 0) {
    if (categoria === '') erroresPasoActual.push('Selecciona una categoría.');
  }
  if (paso === 1) {
    if (nombrePostulante.trim() === '') erroresPasoActual.push('Falta el nombre del solista o la agrupación.');
    if (esComposicion && pseudonimo.trim() === '') erroresPasoActual.push('Falta el pseudónimo (obligatorio en Composición).');
    if (tituloTema.trim() === '') erroresPasoActual.push('Falta el título del tema.');
    if (autorCompositor.trim() === '') erroresPasoActual.push('Falta el autor / compositor.');
    if (ritmo.trim() === '') erroresPasoActual.push('Falta el ritmo.');
    if (tiempo.trim() === '') erroresPasoActual.push('Falta la duración.');
    else if (duracionExcedida) erroresPasoActual.push(`La duración no puede superar los ${duracionMaxima} minutos.`);
  }
  if (paso === 2) {
    if (departamento === '') erroresPasoActual.push('Selecciona un departamento.');
    if (celular1.trim() === '') erroresPasoActual.push('Falta el celular de contacto.');
  }
  if (paso === 3) {
    if (integrantes.length < integrantesMin || integrantes.length > integrantesMax) {
      erroresPasoActual.push(
        `Se ${integrantesMin === 1 && integrantesMax === 1 ? 'requiere' : 'requieren'} ${rangoIntegrantesTexto} integrante(s) — hoy hay ${integrantes.length}.`,
      );
    }
    integrantes.forEach((i, index) => {
      const etiqueta = esGrupal ? `Integrante ${index + 1}` : 'El postulante';
      if (i.nombre.trim() === '') erroresPasoActual.push(`${etiqueta}: falta el nombre.`);
      if (i.ciNumero.trim() === '') erroresPasoActual.push(`${etiqueta}: falta el número de C.I.`);
      if (i.fechaNacimiento === '') erroresPasoActual.push(`${etiqueta}: falta la fecha de nacimiento.`);
      else if (rangoEdadTexto && !cumpleRangoEdad(i.fechaNacimiento, edadMinima, edadMaxima)) {
        erroresPasoActual.push(`${etiqueta}: debe tener ${rangoEdadTexto} al 10 de septiembre de 2026.`);
      }
    });
    if (acompanantes.length > acompanantesMax) {
      erroresPasoActual.push(`Esta categoría permite hasta ${acompanantesMax} acompañante(s) — hoy hay ${acompanantes.length}.`);
    }
    acompanantes.forEach((a, index) => {
      if (a.nombre.trim() === '') erroresPasoActual.push(`Acompañante ${index + 1}: falta el nombre.`);
      if (a.ciNumero.trim() === '') erroresPasoActual.push(`Acompañante ${index + 1}: falta el número de C.I.`);
    });
    if (requiereAdultoResponsable) {
      if (adultoResponsableNombre.trim() === '') erroresPasoActual.push('Falta el nombre del adulto responsable.');
      if (adultoResponsableCiNumero.trim() === '') erroresPasoActual.push('Falta el C.I. del adulto responsable.');
      if (adultoResponsableCelular.trim() === '') erroresPasoActual.push('Falta el celular del adulto responsable.');
    }
  }
  if (paso === 4) {
    if (!aceptaBases) erroresPasoActual.push('Debes aceptar las bases y condiciones de la convocatoria.');
    if (!declaracionVoluntaria) erroresPasoActual.push('Debes marcar la declaración voluntaria.');
    if (requiereAdultoResponsable && !autorizaAdultoResponsable) {
      erroresPasoActual.push('Debes marcar la autorización del adulto responsable para la participación del o la menor.');
    }
  }

  const scrollArriba = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const irAPaso = (index: number) => {
    if (index <= pasoMaximo) setPaso(index);
    scrollArriba();
  };

  const siguiente = () => {
    if (!puedeAvanzar) {
      setMostrarErrores(true);
      return;
    }
    const nuevo = Math.min(paso + 1, PASOS.length - 1);
    setPaso(nuevo);
    setPasoMaximo((m) => Math.max(m, nuevo));
    scrollArriba();
  };

  const anterior = () => {
    setPaso((p) => Math.max(p - 1, 0));
    scrollArriba();
  };

  const seleccionarCategoria = (nombre: string) => {
    setCategoria(nombre);
    const info = obtenerCategoriaInfo(nombre);
    const min = info?.integrantesMin ?? 1;
    const max = info?.integrantesMax ?? 1;
    setIntegrantes((prev) => {
      let siguiente = prev.length > max ? prev.slice(0, max) : prev;
      // Solo se autocompleta hasta el mínimo en categorías de tope fijo
      // (Dúo=2, Trío=3), porque ahí no hay botón de "agregar" para llegar al
      // número exacto. En categorías de rango (ej. Estudiantina 8-15) se deja
      // que el usuario los agregue de a uno con el botón "+ Agregar
      // integrante", en vez de tirarle de golpe el mínimo de tarjetas vacías.
      if (min === max) {
        while (siguiente.length < min) siguiente = [...siguiente, crearIntegrante()];
      }
      return siguiente;
    });
    const acompMax = info?.acompanantesMax ?? 0;
    setAcompanantes((prev) => (prev.length > acompMax ? prev.slice(0, acompMax) : prev));
  };

  const actualizarIntegrante = (id: string, campo: keyof Integrante, valor: string) => {
    setIntegrantes((prev) => prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  };

  const agregarIntegrante = () => {
    if (integrantes.length >= integrantesMax) return;
    setIntegrantes((prev) => [...prev, crearIntegrante()]);
  };

  const quitarIntegrante = (id: string) => {
    setIntegrantes((prev) => (prev.length > integrantesMin ? prev.filter((i) => i.id !== id) : prev));
  };

  const actualizarAcompanante = (id: string, campo: keyof Acompanante, valor: string) => {
    setAcompanantes((prev) => prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)));
  };

  const agregarAcompanante = () => {
    if (acompanantes.length >= acompanantesMax) return;
    setAcompanantes((prev) => [...prev, crearAcompanante()]);
  };

  const quitarAcompanante = (id: string) => {
    setAcompanantes((prev) => prev.filter((a) => a.id !== id));
  };

  const enviar = async () => {
    if (!formularioCompleto || enviando) {
      setMostrarErrores(true);
      return;
    }

    setEnviando(true);
    setErrorEnvio('');

    const codigoDpto = codigoDepartamento(departamento);
    if (!codigoDpto) {
      setErrorEnvio('El departamento seleccionado no es válido. Vuelve al paso "Postulante" y elígelo de nuevo.');
      setEnviando(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    let res: Response;
    try {
      res = await fetch(`${apiUrl}/inscripciones`, {
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
          departamento: codigoDpto,
          celular1,
          celular2: celular2 || undefined,
          integrantes: integrantes.map(
            ({ nombre, ciNumero, ciExtension, fechaNacimiento, whatsapp, direccion, instrumento }) => ({
              nombre,
              ciNumero,
              ciExtension: ciExtension || undefined,
              fechaNacimiento,
              whatsapp: whatsapp || undefined,
              direccion: direccion || undefined,
              instrumento: instrumento || undefined,
            }),
          ),
          acompanantes:
            acompanantes.length > 0
              ? acompanantes.map(({ nombre, ciNumero, ciExtension, instrumento }) => ({
                  nombre,
                  ciNumero: ciNumero || undefined,
                  ciExtension: ciExtension || undefined,
                  instrumento: instrumento || undefined,
                }))
              : undefined,
          aceptaBases,
          declaracionVoluntaria,
          adultoResponsableNombre: requiereAdultoResponsable ? adultoResponsableNombre : undefined,
          adultoResponsableCiNumero: requiereAdultoResponsable ? adultoResponsableCiNumero : undefined,
          adultoResponsableCiExtension:
            requiereAdultoResponsable && adultoResponsableCiExtension ? adultoResponsableCiExtension : undefined,
          adultoResponsableCelular: requiereAdultoResponsable ? adultoResponsableCelular : undefined,
          autorizaParticipacionAdultoResponsable: requiereAdultoResponsable ? autorizaAdultoResponsable : undefined,
        }),
      });
    } catch {
      // El fetch en sí falló: no hubo respuesta del servidor (servidor caído,
      // sin internet, CORS, etc.) — acá sí aplica "verifica tu conexión".
      setErrorEnvio('No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.');
      setEnviando(false);
      return;
    }

    if (!res.ok) {
      // Hubo respuesta pero fue un error (400/404/500...) — mostramos el
      // motivo real que da la API en vez de un mensaje genérico de conexión.
      let mensaje = `No pudimos enviar tu inscripción (error ${res.status}).`;
      try {
        const cuerpo = await res.json();
        if (cuerpo?.message) {
          mensaje = Array.isArray(cuerpo.message) ? cuerpo.message.join(' ') : String(cuerpo.message);
        }
      } catch {
        // el cuerpo no era JSON — nos quedamos con el mensaje genérico
      }
      setErrorEnvio(mensaje);
      setEnviando(false);
      return;
    }

    setEnviado(true);
    scrollArriba();
    setEnviando(false);
  };

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
      acompanantes,
      aceptaBases,
      declaracionVoluntaria,
      adultoResponsable: requiereAdultoResponsable
        ? {
            nombre: adultoResponsableNombre,
            ciNumero: adultoResponsableCiNumero,
            ciExtension: adultoResponsableCiExtension,
            celular: adultoResponsableCelular,
          }
        : null,
    });
  };

  return (
    <>
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

      {!enviado && !mostrarFormulario && (
        <section className="flex flex-col gap-8 mb-16!">
          {/* Video tutorial + descarga de la convocatoria — ambos placeholder
              hasta tener el video real y el link de Drive del PDF. */}
          <div className="grid lg:grid-cols-[2fr_1fr] gap-4 max-w-4xl w-full mx-auto items-stretch">
            <div
              className={`${panelClass} aspect-video flex flex-col items-center justify-center gap-3 p-6!`}
            >
              <TelonDecor />
              <div className="w-16 h-16 rounded-full bg-[#1e63b8]/10 flex items-center justify-center text-[#1e63b8]">
                <PlayCircle size={32} />
              </div>
              <p className="text-(--text-primary) font-semibold">Video tutorial próximamente</p>
              <p className="text-(--text-muted) text-sm text-center max-w-sm">
                Acá vas a encontrar un video explicando cómo completar tu inscripción paso a paso.
              </p>
            </div>

            <a
              href={CONVOCATORIA_URL || undefined}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!CONVOCATORIA_URL) e.preventDefault();
              }}
              aria-disabled={!CONVOCATORIA_URL}
              className={`${panelClass} flex flex-col items-center justify-center gap-3 p-6! text-center transition-all duration-300 ${
                CONVOCATORIA_URL ? 'hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
              }`}
            >
              <TelonDecor />
              <div className="w-16 h-16 rounded-full bg-[#2e7d46]/10 flex items-center justify-center text-[#2e7d46]">
                <FileDown size={28} />
              </div>
              <p className="text-(--text-primary) font-semibold">Descargar convocatoria</p>
              <p className="text-(--text-muted) text-sm max-w-45">
                {CONVOCATORIA_URL ? 'PDF con las bases completas.' : 'Enlace próximamente.'}
              </p>
            </a>
          </div>

          {/* Detalles clave de la convocatoria */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl w-full mx-auto">
            <div className="flex gap-3 items-start rounded-lg border border-(--border) bg-white p-4!">
              <CalendarDays size={20} className="text-[#1e63b8] shrink-0 mt-0.5!" />
              <p className="text-sm text-(--text-secondary)">
                <strong className="text-(--text-primary)">Etapa final: 20 y 21 de noviembre de 2026</strong>, en el
                Teatro Internacional Oruro.
              </p>
            </div>
            <div className="flex gap-3 items-start rounded-lg border border-(--border) bg-white p-4!">
              <Gift size={20} className="text-[#2e7d46] shrink-0 mt-0.5!" />
              <p className="text-sm text-(--text-secondary)">
                <strong className="text-(--text-primary)">La inscripción es totalmente gratuita.</strong> Se llena
                el formulario digital y se presentan los anexos firmados.
              </p>
            </div>
            <div className="flex gap-3 items-start rounded-lg border border-(--border) bg-white p-4!">
              <ShieldAlert size={20} className="text-[#d52b1e] shrink-0 mt-0.5!" />
              <p className="text-sm text-(--text-secondary)">
                <strong className="text-(--text-primary)">No pueden postular artistas profesionales</strong>,
                salvo en las categorías Composición y Especial.
              </p>
            </div>
            <details className="group rounded-lg border border-(--border) bg-white p-4! [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex gap-3 items-start cursor-pointer list-none">
                <ListMusic size={20} className="text-[#1e63b8] shrink-0 mt-0.5!" />
                <span className="text-sm text-(--text-secondary) flex-1">
                  <strong className="text-(--text-primary)">13 categorías</strong> — solistas, agrupaciones,
                  infantil, composición y más.
                </span>
                <ChevronDown size={16} className="text-(--text-muted) shrink-0 mt-0.5! transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4! pt-4! border-t border-(--border) flex flex-col gap-3">
                {GRUPOS_CATEGORIA.map((grupo) => (
                  <div key={grupo.label}>
                    <h4 className="text-xs font-semibold tracking-widest text-(--text-muted) uppercase mb-1!">
                      {grupo.label}
                    </h4>
                    <p className="text-sm text-(--text-secondary)">
                      {grupo.items.map((item) => item.nombre).join(' · ')}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </div>

          <button
            type="button"
            onClick={() => {
              setMostrarFormulario(true);
              scrollArriba();
            }}
            className="inline-flex items-center gap-2 self-center px-8! py-3.5! rounded-lg font-semibold text-white bg-[#d52b1e] shadow-md shadow-[#d52b1e]/25 transition-all duration-300 hover:bg-[#b82419] hover:-translate-y-0.5 cursor-pointer"
          >
            Iniciar inscripción <ArrowRight size={18} />
          </button>
        </section>
      )}

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
          </div>
          <p className="text-(--text-muted) text-xs max-w-lg">
            El Word incluye la Ficha de Postulación (Anexo 1) y, por cada integrante, su propia Carta
            de Presentación (Anexo 2) y Declaración Voluntaria (Anexo 3), ya que estos dos anexos son
            personales. Las firmas quedan en blanco para completarlas a mano.
          </p>
        </section>
      ) : mostrarFormulario ? (
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
                  {mostrarErrores && categoria === '' && (
                    <p className="text-xs text-[#d52b1e] font-medium mt-2!">Selecciona una categoría para continuar.</p>
                  )}
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
                  <Campo
                    label="Nombre"
                    required
                    hint="Nombre del solista o de la agrupación."
                    error={mostrarErrores && nombrePostulante.trim() === '' ? 'Completa este campo.' : undefined}
                  >
                    <input
                      className={inputClass}
                      value={nombrePostulante}
                      onChange={(e) => setNombrePostulante(soloNombre(e.target.value))}
                      placeholder="Ej: LOS KJARKAS"
                    />
                  </Campo>
                  {esComposicion && (
                    <Campo
                      label="Pseudónimo"
                      required
                      hint="Solo para la categoría Composición."
                      error={mostrarErrores && pseudonimo.trim() === '' ? 'Completa este campo.' : undefined}
                    >
                      <input
                        className={inputClass}
                        value={pseudonimo}
                        onChange={(e) => setPseudonimo(e.target.value)}
                        placeholder="Tu pseudónimo artístico"
                      />
                    </Campo>
                  )}
                  <Campo
                    label="Título del tema"
                    required
                    error={mostrarErrores && tituloTema.trim() === '' ? 'Completa este campo.' : undefined}
                  >
                    <input
                      className={inputClass}
                      value={tituloTema}
                      onChange={(e) => setTituloTema(e.target.value)}
                      placeholder="Ej: Illimani"
                    />
                  </Campo>
                  <Campo
                    label="Autor / Compositor"
                    required
                    error={mostrarErrores && autorCompositor.trim() === '' ? 'Completa este campo.' : undefined}
                  >
                    <input
                      className={inputClass}
                      value={autorCompositor}
                      onChange={(e) => setAutorCompositor(soloNombre(e.target.value))}
                      placeholder="NOMBRE DEL AUTOR O COMPOSITOR"
                    />
                  </Campo>
                  <Campo
                    label="Ritmo"
                    required
                    error={mostrarErrores && ritmo.trim() === '' ? 'Completa este campo.' : undefined}
                  >
                    <input
                      className={inputClass}
                      value={ritmo}
                      onChange={(e) => setRitmo(e.target.value)}
                      placeholder="Ej: Huayño, Cueca, Morenada..."
                    />
                  </Campo>
                  <Campo
                    label={`Duración (máximo ${duracionMaxima} min)`}
                    required
                    error={
                      mostrarErrores && tiempo.trim() === ''
                        ? 'Completa este campo.'
                        : duracionExcedida
                          ? `Esta categoría exige máximo ${duracionMaxima} minutos.`
                          : undefined
                    }
                  >
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
                  <h2 className="text-xl font-bold text-(--text-primary) mb-1!">Datos del postulante</h2>
                  <p className="text-(--text-secondary) text-sm">Información de contacto para coordinar tu participación.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <Campo
                    label="Departamento"
                    required
                    error={mostrarErrores && departamento === '' ? 'Selecciona un departamento.' : undefined}
                  >
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
                  <Campo
                    label="Celular de contacto"
                    required
                    error={mostrarErrores && celular1.trim() === '' ? 'Completa este campo.' : undefined}
                  >
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
                        ? `Agrega ${rangoIntegrantesTexto} integrantes, según la categoría.`
                        : 'Datos personales de quien postula, para la ficha de inscripción.'}
                    </p>
                    {mostrarErrores && (integrantes.length < integrantesMin || integrantes.length > integrantesMax) && (
                      <p className="text-xs text-[#d52b1e] font-medium mt-1!">
                        Esta categoría exige {rangoIntegrantesTexto} integrante(s) — hoy hay {integrantes.length}.
                      </p>
                    )}
                  </div>
                  {integrantesMax > integrantesMin && (
                    <button
                      type="button"
                      onClick={agregarIntegrante}
                      disabled={integrantes.length >= integrantesMax}
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
                        {integrantes.length > integrantesMin && (
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
                        <Campo
                          label="Nombres y apellidos"
                          required
                          error={mostrarErrores && integrante.nombre.trim() === '' ? 'Completa este campo.' : undefined}
                        >
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
                          <div
                            className={
                              mostrarErrores && integrante.ciNumero.trim() === ''
                                ? 'flex items-end gap-3 [&_input]:border-[#d52b1e] [&_input]:bg-[#d52b1e]/5'
                                : 'flex items-end gap-3'
                            }
                          >
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
                          {mostrarErrores && integrante.ciNumero.trim() === '' ? (
                            <p className="text-xs text-[#d52b1e] font-medium mt-1!">Completa el número de C.I.</p>
                          ) : (
                            <p className="text-xs text-(--text-muted) mt-1!">
                              El complemento es opcional: código alfanumérico que va después del guion, ej.
                              123456-1A.
                            </p>
                          )}
                        </div>
                        <Campo
                          label="Fecha de nacimiento"
                          required
                          hint={rangoEdadTexto ? `Esta categoría exige tener ${rangoEdadTexto} al 10 de septiembre de 2026.` : undefined}
                          error={
                            mostrarErrores && integrante.fechaNacimiento === ''
                              ? 'Completa este campo.'
                              : integrante.fechaNacimiento !== '' &&
                                  rangoEdadTexto &&
                                  !cumpleRangoEdad(integrante.fechaNacimiento, edadMinima, edadMaxima)
                                ? `Debe tener ${rangoEdadTexto} al 10 de septiembre de 2026 para esta categoría.`
                                : undefined
                          }
                        >
                          <input
                            type="date"
                            className={inputClass}
                            value={integrante.fechaNacimiento}
                            onChange={(e) => actualizarIntegrante(integrante.id, 'fechaNacimiento', e.target.value)}
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
                  {integrantesMax > integrantesMin && (
                    <button
                      type="button"
                      onClick={agregarIntegrante}
                      disabled={integrantes.length >= integrantesMax}
                      className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#1e63b8] hover:text-[#164a8c] disabled:text-(--text-muted) disabled:cursor-not-allowed transition-colors cursor-pointer rounded-xl border border-dashed border-[#1e63b8]/40 hover:border-[#1e63b8]/60 disabled:border-(--border) py-3! self-stretch"
                    >
                      <Plus size={16} /> Agregar integrante
                    </button>
                  )}
                </div>

                {acompanantesMax > 0 && (
                  <div className="flex flex-col gap-4 pt-2! border-t border-(--border)">
                    <div className="flex flex-wrap items-end justify-between gap-3 pt-4!">
                      <div>
                        <h3 className="text-base font-bold text-(--text-primary) mb-1!">Acompañantes musicales</h3>
                        <p className="text-(--text-secondary) text-sm">
                          Opcional, hasta {acompanantesMax} músico{acompanantesMax > 1 ? 's' : ''} de acompañamiento.
                          La convocatoria exige nombre y C.I. de cada uno.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={agregarAcompanante}
                        disabled={acompanantes.length >= acompanantesMax}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e63b8] hover:text-[#164a8c] disabled:text-(--text-muted) disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Plus size={16} /> Agregar acompañante
                      </button>
                    </div>

                    {acompanantes.map((acompanante, index) => (
                      <div key={acompanante.id} className="rounded-xl border border-(--border) bg-(--bg-primary) p-5!">
                        <div className="flex items-center justify-between mb-4!">
                          <span className="text-sm font-bold text-(--text-secondary)">Acompañante {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => quitarAcompanante(acompanante.id)}
                            className="text-(--text-muted) hover:text-[#d52b1e] transition-colors cursor-pointer"
                            aria-label="Quitar acompañante"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <Campo
                            label="Nombres y apellidos"
                            required
                            error={mostrarErrores && acompanante.nombre.trim() === '' ? 'Completa este campo.' : undefined}
                          >
                            <input
                              className={inputClass}
                              value={acompanante.nombre}
                              onChange={(e) =>
                                actualizarAcompanante(acompanante.id, 'nombre', soloNombre(e.target.value))
                              }
                              placeholder="NOMBRE COMPLETO"
                            />
                          </Campo>
                          <div>
                            <label className={labelClass}>
                              Carnet de identidad <span className="text-[#d52b1e]">*</span>
                            </label>
                            <div
                              className={
                                mostrarErrores && acompanante.ciNumero.trim() === ''
                                  ? 'flex items-end gap-3 [&_input]:border-[#d52b1e] [&_input]:bg-[#d52b1e]/5'
                                  : 'flex items-end gap-3'
                              }
                            >
                              <div className="flex-1 min-w-0">
                                <input
                                  type="tel"
                                  inputMode="numeric"
                                  className={inputClass}
                                  value={acompanante.ciNumero}
                                  onChange={(e) =>
                                    actualizarAcompanante(acompanante.id, 'ciNumero', soloDigitos(e.target.value))
                                  }
                                  placeholder="Ej: 1234567"
                                />
                              </div>
                              <span className="pb-2.5! text-(--text-muted) font-bold text-lg select-none">-</span>
                              <div className="w-20 shrink-0">
                                <input
                                  type="text"
                                  className={`${inputClass} text-center`}
                                  value={acompanante.ciExtension}
                                  onChange={(e) =>
                                    actualizarAcompanante(acompanante.id, 'ciExtension', soloAlfanumerico(e.target.value))
                                  }
                                  placeholder="1A"
                                  maxLength={4}
                                />
                              </div>
                            </div>
                            {mostrarErrores && acompanante.ciNumero.trim() === '' && (
                              <p className="text-xs text-[#d52b1e] font-medium mt-1!">Completa el número de C.I.</p>
                            )}
                          </div>
                          <Campo label="Instrumento" hint="Si aplica">
                            <input
                              className={inputClass}
                              value={acompanante.instrumento}
                              onChange={(e) => actualizarAcompanante(acompanante.id, 'instrumento', e.target.value)}
                              placeholder="Ej: Charango, guitarra..."
                            />
                          </Campo>
                        </div>
                      </div>
                    ))}
                    {acompanantes.length < acompanantesMax && (
                      <button
                        type="button"
                        onClick={agregarAcompanante}
                        className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#1e63b8] hover:text-[#164a8c] transition-colors cursor-pointer rounded-xl border border-dashed border-[#1e63b8]/40 hover:border-[#1e63b8]/60 py-3! self-stretch"
                      >
                        <Plus size={16} /> Agregar acompañante
                      </button>
                    )}
                  </div>
                )}

                {requiereAdultoResponsable && (
                  <div className="flex flex-col gap-4 pt-2! border-t border-(--border)">
                    <div className="pt-4!">
                      <h3 className="text-base font-bold text-(--text-primary) mb-1!">Adulto responsable</h3>
                      <p className="text-(--text-secondary) text-sm">
                        Nombre, C.I. y celular del padre, madre o tutor legal — la convocatoria lo exige
                        para categorías infantiles (Anexo 4).
                      </p>
                    </div>
                    <div className="rounded-xl border border-(--border) bg-(--bg-primary) p-5!">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Campo
                          label="Nombres y apellidos"
                          required
                          error={
                            mostrarErrores && adultoResponsableNombre.trim() === '' ? 'Completa este campo.' : undefined
                          }
                        >
                          <input
                            className={inputClass}
                            value={adultoResponsableNombre}
                            onChange={(e) => setAdultoResponsableNombre(soloNombre(e.target.value))}
                            placeholder="NOMBRE COMPLETO"
                          />
                        </Campo>
                        <div>
                          <label className={labelClass}>
                            Carnet de identidad <span className="text-[#d52b1e]">*</span>
                          </label>
                          <div
                            className={
                              mostrarErrores && adultoResponsableCiNumero.trim() === ''
                                ? 'flex items-end gap-3 [&_input]:border-[#d52b1e] [&_input]:bg-[#d52b1e]/5'
                                : 'flex items-end gap-3'
                            }
                          >
                            <div className="flex-1 min-w-0">
                              <input
                                type="tel"
                                inputMode="numeric"
                                className={inputClass}
                                value={adultoResponsableCiNumero}
                                onChange={(e) => setAdultoResponsableCiNumero(soloDigitos(e.target.value))}
                                placeholder="Ej: 1234567"
                              />
                            </div>
                            <span className="pb-2.5! text-(--text-muted) font-bold text-lg select-none">-</span>
                            <div className="w-20 shrink-0">
                              <input
                                type="text"
                                className={`${inputClass} text-center`}
                                value={adultoResponsableCiExtension}
                                onChange={(e) => setAdultoResponsableCiExtension(soloAlfanumerico(e.target.value))}
                                placeholder="1A"
                                maxLength={4}
                              />
                            </div>
                          </div>
                          {mostrarErrores && adultoResponsableCiNumero.trim() === '' && (
                            <p className="text-xs text-[#d52b1e] font-medium mt-1!">Completa el número de C.I.</p>
                          )}
                        </div>
                        <Campo
                          label="Celular"
                          required
                          error={
                            mostrarErrores && adultoResponsableCelular.trim() === '' ? 'Completa este campo.' : undefined
                          }
                        >
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={8}
                            className={inputClass}
                            value={adultoResponsableCelular}
                            onChange={(e) => setAdultoResponsableCelular(soloDigitos(e.target.value))}
                            placeholder="Ej: 70000000"
                          />
                        </Campo>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paso 4: Declaraciones */}
            {paso === 4 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-(--text-primary) mb-1!">Revisa y confirma</h2>
                  <p className="text-(--text-secondary) text-sm">
                    Revisa que todos los datos sean correctos antes de enviar — no podrás editarlos
                    después de la revisión del comité organizador.
                  </p>
                </div>

                <div className="rounded-xl border border-(--border) bg-(--bg-primary) p-5!">
                  <h3 className="text-sm font-bold text-(--text-secondary) mb-4! flex items-center gap-2">
                    <Sparkles size={15} className="text-[#1e63b8]" /> Resumen de tu postulación
                  </h3>

                  <h4 className="text-xs font-semibold tracking-widest text-(--text-muted) uppercase mb-2!">La obra</h4>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5!">
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Nombre</dt>
                      <dd className="text-(--text-primary) font-medium">{nombrePostulante || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Categoría</dt>
                      <dd className="text-(--text-primary) font-medium">{categoria || '—'}</dd>
                    </div>
                    {esComposicion && (
                      <div className="flex justify-between gap-4 sm:block">
                        <dt className="text-(--text-muted)">Pseudónimo</dt>
                        <dd className="text-(--text-primary) font-medium">{pseudonimo || '—'}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Título del tema</dt>
                      <dd className="text-(--text-primary) font-medium">{tituloTema || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Autor / Compositor</dt>
                      <dd className="text-(--text-primary) font-medium">{autorCompositor || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Ritmo</dt>
                      <dd className="text-(--text-primary) font-medium">{ritmo || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Duración</dt>
                      <dd className="text-(--text-primary) font-medium">{tiempo ? `${tiempo} min` : '—'}</dd>
                    </div>
                  </dl>

                  <h4 className="text-xs font-semibold tracking-widest text-(--text-muted) uppercase mb-2!">
                    Datos del postulante
                  </h4>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5!">
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Departamento</dt>
                      <dd className="text-(--text-primary) font-medium">{departamento || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 sm:block">
                      <dt className="text-(--text-muted)">Celular de contacto</dt>
                      <dd className="text-(--text-primary) font-medium">{celular1 || '—'}</dd>
                    </div>
                    {celular2 && (
                      <div className="flex justify-between gap-4 sm:block">
                        <dt className="text-(--text-muted)">Celular alternativo</dt>
                        <dd className="text-(--text-primary) font-medium">{celular2}</dd>
                      </div>
                    )}
                  </dl>

                  <h4 className="text-xs font-semibold tracking-widest text-(--text-muted) uppercase mb-2!">
                    {esGrupal ? `Integrantes (${integrantes.length})` : 'Datos personales'}
                  </h4>
                  <div className="flex flex-col gap-2 mb-2!">
                    {integrantes.map((integrante, index) => (
                      <div key={integrante.id} className="rounded-lg border border-(--border) bg-white p-3! text-sm">
                        <p className="font-semibold text-(--text-primary)">
                          {esGrupal ? `${index + 1}. ` : ''}
                          {integrante.nombre || '—'}
                        </p>
                        <p className="text-(--text-muted) mt-0.5!">
                          C.I. {ciCompletoTexto(integrante.ciNumero, integrante.ciExtension)} · Nace:{' '}
                          {fechaLegible(integrante.fechaNacimiento)}
                          {integrante.whatsapp && ` · WhatsApp: ${integrante.whatsapp}`}
                          {integrante.direccion && ` · Dirección: ${integrante.direccion}`}
                          {integrante.instrumento && ` · Instrumento: ${integrante.instrumento}`}
                        </p>
                      </div>
                    ))}
                  </div>

                  {acompanantes.length > 0 && (
                    <>
                      <h4 className="text-xs font-semibold tracking-widest text-(--text-muted) uppercase mb-2! mt-3!">
                        Acompañantes musicales ({acompanantes.length})
                      </h4>
                      <div className="flex flex-col gap-2">
                        {acompanantes.map((acompanante, index) => (
                          <div key={acompanante.id} className="rounded-lg border border-(--border) bg-white p-3! text-sm">
                            <p className="font-semibold text-(--text-primary)">
                              {index + 1}. {acompanante.nombre || '—'}
                            </p>
                            <p className="text-(--text-muted) mt-0.5!">
                              C.I. {ciCompletoTexto(acompanante.ciNumero, acompanante.ciExtension)}
                              {acompanante.instrumento && ` · Instrumento: ${acompanante.instrumento}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {requiereAdultoResponsable && (
                    <>
                      <h4 className="text-xs font-semibold tracking-widest text-(--text-muted) uppercase mb-2! mt-3!">
                        Adulto responsable
                      </h4>
                      <div className="rounded-lg border border-(--border) bg-white p-3! text-sm">
                        <p className="font-semibold text-(--text-primary)">{adultoResponsableNombre || '—'}</p>
                        <p className="text-(--text-muted) mt-0.5!">
                          C.I. {ciCompletoTexto(adultoResponsableCiNumero, adultoResponsableCiExtension)}
                          {adultoResponsableCelular && ` · Celular: ${adultoResponsableCelular}`}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-lg border border-(--border) bg-(--bg-primary) overflow-hidden">
                  <details className="group [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center gap-2 cursor-pointer list-none px-4! py-3! text-sm font-semibold text-[#1e63b8] hover:bg-[#1e63b8]/5 transition-colors">
                      <FileText size={16} className="shrink-0" />
                      Ver lo más importante de las bases y condiciones
                      <ChevronDown size={16} className="ml-auto shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="px-4! pb-4! pt-1! flex flex-col gap-2 text-sm text-(--text-secondary) list-disc list-inside border-t border-(--border)">
                      <li className="pt-3!">
                        El veredicto del jurado calificador es <strong>inapelable</strong> en todas las etapas
                        (preselección, etapa final y premiación).
                      </li>
                      <li>
                        No pueden postular artistas profesionales, salvo en las categorías Composición y
                        Especial.
                      </li>
                      <li>
                        No pueden postular miembros del comité organizador ni sus familiares hasta el
                        segundo grado de consanguinidad.
                      </li>
                      <li>Ningún concursante puede postular o participar en más de una categoría.</li>
                      <li>
                        Con tu participación autorizas al Comité Organizador a usar, transmitir y difundir
                        tu obra e interpretación (radio, TV, redes sociales u otro medio) con fines
                        promocionales o comerciales.
                      </li>
                      <li>Los documentos presentados no serán devueltos.</li>
                      <li>
                        Si clasificas a la etapa final, debes trasladarte a Oruro por tus propios medios;
                        el Comité Organizador no cubre pasajes ni transporte.
                      </li>
                      <li>
                        El Comité Organizador solo cubre hospedaje y alimentación a quienes clasifiquen a
                        la etapa final (y a sus acompañantes/adultos responsables, según la categoría).
                      </li>
                    </ul>
                  </details>
                </div>

                <label
                  className={`flex items-start gap-3 rounded-lg border p-4! cursor-pointer transition-colors ${
                    mostrarErrores && !aceptaBases
                      ? 'border-[#d52b1e]/60 bg-[#d52b1e]/5'
                      : 'border-(--border) bg-(--bg-primary) hover:border-[#1e63b8]/35'
                  }`}
                >
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

                <label
                  className={`flex items-start gap-3 rounded-lg border p-4! cursor-pointer transition-colors ${
                    mostrarErrores && !declaracionVoluntaria
                      ? 'border-[#d52b1e]/60 bg-[#d52b1e]/5'
                      : 'border-(--border) bg-(--bg-primary) hover:border-[#1e63b8]/35'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={declaracionVoluntaria}
                    onChange={(e) => setDeclaracionVoluntaria(e.target.checked)}
                    className="mt-1! w-4 h-4 accent-[#1e63b8] shrink-0 cursor-pointer"
                  />
                  <span className="text-sm text-(--text-secondary)">
                    {esExentoProfesional ? (
                      <>
                        Declaro que mi obra es inédita y exonero al Comité Organizador de toda
                        responsabilidad ante eventuales denuncias de plagio o propiedad.
                      </>
                    ) : (
                      <>
                        Declaro de manera voluntaria que no fui, ni actualmente soy, miembro de una
                        agrupación musical profesional.
                      </>
                    )}{' '}
                    <span className="text-[#d52b1e]">*</span>
                  </span>
                </label>

                {requiereAdultoResponsable && (
                  <label
                    className={`flex items-start gap-3 rounded-lg border p-4! cursor-pointer transition-colors ${
                      mostrarErrores && !autorizaAdultoResponsable
                        ? 'border-[#d52b1e]/60 bg-[#d52b1e]/5'
                        : 'border-(--border) bg-(--bg-primary) hover:border-[#1e63b8]/35'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={autorizaAdultoResponsable}
                      onChange={(e) => setAutorizaAdultoResponsable(e.target.checked)}
                      className="mt-1! w-4 h-4 accent-[#1e63b8] shrink-0 cursor-pointer"
                    />
                    <span className="text-sm text-(--text-secondary)">
                      Yo, <strong>{adultoResponsableNombre || '[nombre del adulto responsable]'}</strong>,
                      con C.I. {ciCompletoTexto(adultoResponsableCiNumero, adultoResponsableCiExtension)},
                      declaro encontrarme como padre, madre o tutor legal del o la menor{' '}
                      <strong>{nombrePostulante || '[nombre del postulante]'}</strong> y autorizo
                      expresamente su participación en el XXXIII Festival Nacional de la Canción
                      Boliviana “Aquí… Canta Bolivia”, asumiendo la responsabilidad que corresponde a
                      un adulto responsable durante su intervención en el certamen (Anexo 4).{' '}
                      <span className="text-[#d52b1e]">*</span>
                    </span>
                  </label>
                )}
              </div>
            )}
          </section>

          {mostrarErrores && erroresPasoActual.length > 0 && (
            <div className="mb-6! rounded-lg border border-[#d52b1e]/30 bg-[#d52b1e]/8 px-4! py-3! text-sm text-[#b82419]">
              <p className="font-semibold mb-1.5!">
                Corrige lo siguiente antes de {paso === PASOS.length - 1 ? 'enviar' : 'continuar'}:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {erroresPasoActual.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {mostrarErrores && paso === PASOS.length - 1 && erroresPasoActual.length === 0 && !formularioCompleto && (
            <div className="mb-6! rounded-lg border border-[#d52b1e]/30 bg-[#d52b1e]/8 px-4! py-3! text-sm text-[#b82419]">
              Falta completar el paso "{PASOS[validaciones.findIndex((v) => !v)]?.titulo}" — revísalo antes de
              enviar.
            </div>
          )}

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
              // Ojo: a propósito NO usamos el atributo `disabled` cuando falta
              // llenar algo — un botón disabled no dispara onClick, así que
              // siguiente() nunca llegaría a hacer setMostrarErrores(true) y
              // el usuario se quedaría sin saber qué le falta. En su lugar se
              // ve "apagado" con aria-disabled + estilos, pero sigue siendo
              // clickeable para poder mostrar los errores.
              <button
                type="button"
                onClick={siguiente}
                aria-disabled={!puedeAvanzar}
                className={`inline-flex items-center gap-1.5 px-6! py-3! rounded-lg font-semibold text-white bg-[#d52b1e] shadow-md shadow-[#d52b1e]/25 transition-all duration-300 cursor-pointer ${
                  puedeAvanzar ? 'hover:bg-[#b82419] hover:-translate-y-0.5' : 'opacity-30'
                }`}
              >
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={enviar}
                disabled={enviando}
                aria-disabled={!formularioCompleto}
                className={`inline-flex items-center gap-1.5 px-6! py-3! rounded-lg font-semibold text-white bg-[#d52b1e] shadow-md shadow-[#d52b1e]/25 transition-all duration-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer ${
                  formularioCompleto && !enviando ? 'hover:bg-[#b82419] hover:-translate-y-0.5' : 'opacity-30'
                }`}
              >
                <Send size={16} /> {enviando ? 'Enviando…' : 'Enviar inscripción'}
              </button>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}

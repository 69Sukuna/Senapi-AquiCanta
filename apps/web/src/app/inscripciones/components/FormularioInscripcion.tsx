'use client';

import { useRef, useState, type ReactNode } from 'react';
import {
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
  Camera,
  X,
  Paperclip,
} from 'lucide-react';
import { generarInscripcionDocx } from '@/lib/generarInscripcionDocx';
import { GRUPOS_CATEGORIAS, obtenerCategoriaInfo } from '@/lib/categorias';
import { DEPARTAMENTOS, type DepartamentoValue } from '@/lib/departamentos';
import { cumpleRangoEdad, edadEnFecha } from '@/lib/edad';
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

const CONVOCATORIA_URL = 'https://drive.google.com/file/d/1wg44MLjogY9rM5OWfLyDGzTwR4MeNoDt/view?usp=drive_link';
// TODO: pegar acá la fecha real de la preselección departamental cuando esté
// definida (ej. "15 de octubre de 2026"). Mientras esté vacío, el modal de
// aviso usa una frase genérica en vez de una fecha inventada.
const FECHA_PRESELECCION = '';

// Íconos propios (public/images/iconos/IACB-16 a 20.svg) para el stepper.
// El SVG original trae el color fijo (fill:gray vía una clase interna) —
// acá se reemplaza por currentColor para que hereden el blanco/café del
// círculo del stepper según esté activo o no, igual que los íconos de
// lucide-react. El dibujo dentro de cada viewBox 512x512 ocupa solo una
// porción chica del lienzo (a diferencia de lucide, que llena casi todo el
// suyo), por eso se agranda el render ~1.8x para que se vean del mismo peso
// visual que los demás íconos, sin recortar el viewBox.
function IconoPropio({ size = 16, children }: { size?: number; children: ReactNode }) {
  const renderSize = size * 2.6;
  return (
    <svg width={renderSize} height={renderSize} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      {children}
    </svg>
  );
}

// IACB-16: Categoría
function IconoCategoria({ size }: { size?: number }) {
  return (
    <IconoPropio size={size}>
      <path d="M252.72,117.52c51.85,0,92.64,34.18,100.64,81.05,5.2,30.43-2.91,57.32-23,80.66a73.57,73.57,0,0,1-6.89,7.12,5.66,5.66,0,0,0-2,4.75q.06,38.37,0,76.73c0,.87,0,1.74,0,2.61-.11,7.05-5.7,11-12.3,8.5-9.49-3.64-18.9-7.52-28.35-11.29-6.94-2.77-13.92-5.48-20.82-8.36a6.94,6.94,0,0,0-5.73,0q-23.82,9.63-47.7,19.11c-1.94.78-3.88,1.58-6,1.33-4.59-.54-7.7-4.22-7.71-9.31q0-21.39,0-42.79c0-12.27,0-24.54,0-36.8a5.57,5.57,0,0,0-2-4.49c-16.76-15.83-27.37-35-30.43-58a97.52,97.52,0,0,1,67-106.2C237.07,119.07,247,117.55,252.72,117.52ZM176.85,215.1a80.32,80.32,0,1,0,80.41-80.16A80.08,80.08,0,0,0,176.85,215.1Zm33.39,114.46q0,12.78,0,25.56c0,3.13.1,3.2,3.06,2,13-5.19,26-10.34,38.95-15.62a12.31,12.31,0,0,1,9.83,0c12.88,5.23,25.8,10.36,38.71,15.53,3.26,1.3,3.29,1.29,3.29-2.2V303.73c0-3.23,0-3.24-2.87-1.77a95.2,95.2,0,0,1-41.72,11c-16.52.42-32-3.57-46.64-11.15-2.58-1.33-2.61-1.3-2.61,1.66Q210.24,316.52,210.24,329.56Z" />
      <path d="M212.57,206.74c5,0,8.49,3.63,8.73,9,.64,14.56,7.48,25.22,20.45,31.84a33.18,33.18,0,0,0,14.57,3.52c5.87.11,9.56,3.75,9.37,9.18-.18,4.92-4.32,8.37-9.86,8.2a53.65,53.65,0,0,1-51.4-46.16,43.8,43.8,0,0,1-.49-6.75C204,210.39,207.68,206.75,212.57,206.74Z" />
    </IconoPropio>
  );
}

// IACB-17: La obra
function IconoLaObra({ size }: { size?: number }) {
  return (
    <IconoPropio size={size}>
      <path d="M260.93,201.33q0-32.94,0-65.89c0-11.23,6.95-18,18.18-17.81a79.57,79.57,0,0,1,34.18,8.87c8.28,4.16,16.62,8.12,26,9.19,2.6.3,5.22.46,7.82.84,9.11,1.34,15.12,8.14,15.16,17.25q.09,17.17,0,34.36c-.06,10-7.2,17.05-17.19,16.93-13.07-.15-25.25-3.85-36.82-9.72-7.33-3.72-14.76-7.12-23-8.19-3.59-.46-3.65-.54-3.65,3.29q0,58.63,0,117.27c0,9.53.57,19.08-1.87,28.52-6.31,24.43-27.77,43.56-52.74,46.73-35.64,4.52-67.42-19.65-71.7-55.24a63.06,63.06,0,0,1,52.51-70.08c18.89-3,35.79,1.6,50.76,13.47.6.48,1.12,1.61,2.05,1,.73-.5.36-1.57.36-2.38Q261,235.54,260.93,201.33ZM218.22,362.56c21.05.64,42.3-16.33,42.64-42.31.3-23.34-19.15-42.61-42.46-42.65-23.46,0-42.75,19-42.81,42.31A42.39,42.39,0,0,0,218.22,362.56Zm123.43-192c0-3.68,0-7.36,0-11,0-1.86-.8-2.75-2.55-2.89-12.29-.95-23.45-5.39-34.26-11A66.21,66.21,0,0,0,285.23,139c-2.79-.47-3.81.25-3.71,3.16.18,5.25.06,10.51.07,15.76,0,7.31,0,7.5,7.12,8.58,11.2,1.68,21.33,6.19,31.29,11.23a64.62,64.62,0,0,0,18.54,5.9c2.47.41,3.23-.36,3.15-2.74C341.57,177.46,341.66,174,341.65,170.52Z" />
    </IconoPropio>
  );
}

// IACB-18: Postulante
function IconoPostulante({ size }: { size?: number }) {
  return (
    <IconoPropio size={size}>
      <path d="M321.53,215.79c-.38,30.77-24.78,56-56.45,55.79-31.31-.23-55.92-24.82-55.8-56.41.14-33.47,28.26-56.69,58.11-55.8C296.91,160.26,321.83,185.71,321.53,215.79Zm-56,37.05A37.43,37.43,0,1,0,228,215.56,37.49,37.49,0,0,0,265.48,252.84Z" />
      <path d="M265.09,296.11q-19.63,0-39.29,0c-13.71,0-23.74,7.74-27.3,20.94-2.82,10.46-5.63,20.91-8.51,31.35-1.33,4.8-4.33,7.43-8.57,7.79-6,.52-11.25-5-9.82-10.81,3.16-12.89,6-25.95,10.63-38.36,6.52-17.38,19.66-27,38.15-29.38a109.53,109.53,0,0,1,13.55-.39c23.46,0,46.92-.07,70.38,0,13.11,0,24.55,4.43,33.82,13.88a44.56,44.56,0,0,1,11.3,19.63c3,11,6.08,22,9,33,1.94,7.42-3.29,13.48-10.46,12.28-4.33-.72-6.6-3.67-7.69-7.71q-4.22-15.54-8.43-31.08c-3.64-13.45-13.55-21.12-27.43-21.14Q284.73,296.08,265.09,296.11Z" />
    </IconoPropio>
  );
}

// IACB-19: Integrantes
function IconoIntegrantes({ size }: { size?: number }) {
  return (
    <IconoPropio size={size}>
      <path d="M276.53,215.79c-.38,30.77-24.78,56-56.45,55.79-31.31-.23-55.92-24.82-55.8-56.41.14-33.47,28.26-56.69,58.11-55.8C251.91,160.26,276.83,185.71,276.53,215.79Zm-56,37.05A37.43,37.43,0,1,0,183,215.56,37.49,37.49,0,0,0,220.48,252.84Z" />
      <path d="M220.09,296.11q-19.64,0-39.29,0c-13.71,0-23.74,7.74-27.3,20.94-2.82,10.46-5.63,20.91-8.51,31.35-1.33,4.8-4.33,7.43-8.57,7.79-6,.52-11.25-5-9.82-10.81,3.16-12.89,6-25.95,10.63-38.36,6.52-17.38,19.66-27,38.15-29.38a109.53,109.53,0,0,1,13.55-.39c23.46,0,46.92-.07,70.38,0,13.11,0,24.55,4.43,33.82,13.88a44.56,44.56,0,0,1,11.3,19.63c3,11,6.08,22,9,33,1.94,7.42-3.29,13.48-10.46,12.28-4.33-.72-6.6-3.67-7.69-7.71q-4.22-15.54-8.43-31.08c-3.64-13.45-13.55-21.12-27.43-21.14Q239.73,296.08,220.09,296.11Z" />
      <path d="M354.42,200A49,49,0,0,1,304,249.11a44.2,44.2,0,0,1-12-1.91c-5.63-1.72-8.45-6.43-7-11.65s6.4-7.76,12.08-6.33c17.48,4.39,33.86-5.4,37.89-22.67S326.75,172,309.1,169.92a30.08,30.08,0,0,0-21.8,5.8c-4.1,2.93-8.32,2.93-11.75.22-5-3.92-4.77-11.05.42-15.08a49,49,0,0,1,54.72-3C345.7,167.14,354.5,182.74,354.42,200Z" />
      <path d="M308.91,256.22h23.73c23.42,0,41.88,14.07,47.91,36.67q3,11.17,5.48,22.48a9,9,0,0,1-6.6,10.66c-5.33,1.51-10.28-1.62-11.82-7.59-1.73-6.74-3.49-13.48-5-20.28A29.7,29.7,0,0,0,332.86,275c-16.38.39-32.77.1-49.15.07a26.16,26.16,0,0,1-4.77-.37c-4.78-.86-8.22-5.14-7.86-9.59a9.28,9.28,0,0,1,9.29-8.84c9.51-.09,19,0,28.54,0Z" />
    </IconoPropio>
  );
}

// IACB-20: Declaración
function IconoDeclaracion({ size }: { size?: number }) {
  return (
    <IconoPropio size={size}>
      <path d="M356,200c-6.3-5.91-12.45-12.15-18.4-18.18l-.13-.14c-2.41-2.45-4.83-4.91-7.26-7.34l-10.68-10.69c-10.31-10.29-21-20.93-31.31-31.52-2.69-2.75-5-3.93-7.92-4.08-1.35-.06-2.7-.15-4.05-.25l-.66,0c-2.6-.19-5.28-.37-8-.4-8.79-.08-17.76-.12-27.45-.12-18.59,0-38,.15-59.22.47a24.72,24.72,0,0,0-8.06,1.66,32.12,32.12,0,0,0-21.28,30.47q0,34.14,0,68.28V351.93a53.79,53.79,0,0,0,.49,7.32c2,14.47,15.68,26.72,29.93,26.74q37.85.06,75.68.06,36.48,0,72.95-.06c15.54,0,29.91-14.35,30.14-30.05.13-8.37.2-16.86.26-25.07l0-3.88c.15-17.88.17-35.57.18-55.19l0-29.23c0-11.31-.27-22.69-.54-31.34C360.6,206.33,359.18,203,356,200ZM165.3,161.21a20.28,20.28,0,0,1,5.58-14.6c3.58-3.61,8.54-5.52,14.32-5.52h.13q13.56.06,27.12,0l55.88-.06c4.69,0,5.48,1.44,5.48,5.79v58.75c0,6.7,2.46,9.19,9.1,9.19h58.63c2.6,0,3.76.1,4.76,1.11s1.11,2.19,1.1,4.68l-.05,131.17c0,9.31-3.52,15.52-10.77,19a20.39,20.39,0,0,1-8.92,1.77H184.77c-11.75,0-19.34-7.67-19.34-19.5V280.62l0-50.15v-1.65C165.5,206.67,165.53,183.76,165.3,161.21ZM330.68,201c-.32,0-32.5,0-38.65,0-4.4,0-4.4-3.82-4.4-5.08V152.53L336,201Z" />
    </IconoPropio>
  );
}

const PASOS = [
  { titulo: 'Categoría', icon: IconoCategoria },
  { titulo: 'La obra', icon: IconoLaObra },
  { titulo: 'Postulante', icon: IconoPostulante },
  { titulo: 'Integrantes', icon: IconoIntegrantes },
  { titulo: 'Declaración', icon: IconoDeclaracion },
] as const;

// Foto del carnet de identidad de una persona — se pide anverso y reverso
// (coincide con "2 fotocopias de C.I." de la convocatoria). Se guarda el
// File crudo (para subirlo recién después de crear la inscripción, ver
// enviar()) más una URL de previsualización (URL.createObjectURL).
interface FotosCarnet {
  fotoCiAnverso: File | null;
  fotoCiAnversoPreviewUrl: string;
  fotoCiReverso: File | null;
  fotoCiReversoPreviewUrl: string;
}

function crearFotosCarnetVacias(): FotosCarnet {
  return { fotoCiAnverso: null, fotoCiAnversoPreviewUrl: '', fotoCiReverso: null, fotoCiReversoPreviewUrl: '' };
}

type LadoFoto = 'anverso' | 'reverso';

function revocarSiExiste(url: string) {
  if (url) URL.revokeObjectURL(url);
}

interface Integrante extends FotosCarnet {
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
    ...crearFotosCarnetVacias(),
  };
}

// Músico de acompañamiento (categorías individuales que lo permiten) — la
// convocatoria solo pide su nombre, C.I. e instrumento, nada más.
interface Acompanante extends FotosCarnet {
  id: string;
  nombre: string;
  ciNumero: string;
  ciExtension: string;
  instrumento: string;
}

function crearAcompanante(): Acompanante {
  return { id: crearId(), nombre: '', ciNumero: '', ciExtension: '', instrumento: '', ...crearFotosCarnetVacias() };
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
  'w-full rounded-lg bg-(--bg-primary) border border-(--border) px-4! py-2.5! text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-(--brand-cafe)/60 focus:ring-2! focus:ring-(--brand-cafe)/15 focus:bg-white transition-colors';
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

function RecuadroFoto({
  lado,
  previewUrl,
  onCambiar,
  onQuitar,
}: {
  lado: LadoFoto;
  previewUrl: string;
  onCambiar: (file: File) => void;
  onQuitar: () => void;
}) {
  const etiqueta = lado === 'anverso' ? 'Anverso' : 'Reverso';
  return (
    <label className="relative flex aspect-3/2 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-dashed border-(--border) bg-(--bg-primary) text-center transition-colors hover:border-(--brand-cafe)/50">
      {previewUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- preview de un File local (blob:), no un asset del proyecto */}
          <img src={previewUrl} alt={etiqueta} className="absolute inset-0 h-full w-full object-cover" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onQuitar();
            }}
            aria-label={`Quitar foto ${etiqueta.toLowerCase()}`}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white cursor-pointer"
          >
            <X size={12} />
          </button>
        </>
      ) : (
        <>
          <Camera size={18} className="text-(--text-muted)" />
          <span className="text-[11px] font-semibold text-(--text-muted)">{etiqueta}</span>
        </>
      )}
      {/* Sin el atributo `capture`: en el celular esto deja elegir entre
          sacar una foto nueva o subir una que ya está en la galería, en vez
          de forzar la cámara directamente. */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onCambiar(file);
          e.target.value = '';
        }}
      />
    </label>
  );
}

function CampoFotoCarnet({
  fotos,
  onCambiar,
  onQuitar,
  obligatorio,
  error,
}: {
  fotos: FotosCarnet;
  onCambiar: (lado: LadoFoto, file: File) => void;
  onQuitar: (lado: LadoFoto) => void;
  obligatorio: boolean;
  error?: boolean;
}) {
  return (
    <div className="md:col-span-2">
      <label className={labelClass}>
        Foto del carnet de identidad{' '}
        {obligatorio ? (
          <span className="text-[#d52b1e]">*</span>
        ) : (
          <span className="font-normal text-(--text-muted)">(recomendado)</span>
        )}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <RecuadroFoto
          lado="anverso"
          previewUrl={fotos.fotoCiAnversoPreviewUrl}
          onCambiar={(file) => onCambiar('anverso', file)}
          onQuitar={() => onQuitar('anverso')}
        />
        <RecuadroFoto
          lado="reverso"
          previewUrl={fotos.fotoCiReversoPreviewUrl}
          onCambiar={(file) => onCambiar('reverso', file)}
          onQuitar={() => onQuitar('reverso')}
        />
      </div>
      {error && <p className="text-xs text-[#d52b1e] font-medium mt-1.5!">Faltan las fotos del carnet (anverso y reverso).</p>}
    </div>
  );
}

function CampoArchivoPdf({
  archivo,
  onCambiar,
  onQuitar,
}: {
  archivo: File | null;
  onCambiar: (file: File) => void;
  onQuitar: () => void;
}) {
  return (
    <div className="md:col-span-2">
      <label className={labelClass}>
        Plan de promoción del festival <span className="font-normal text-(--text-muted)">(PDF, recomendado)</span>
      </label>
      {archivo ? (
        <div className="flex items-center gap-3 rounded-lg border border-(--border) bg-(--bg-primary) px-4! py-3!">
          <FileText size={18} className="text-(--brand-cafe) shrink-0" />
          <span className="flex-1 truncate text-sm text-(--text-primary)">{archivo.name}</span>
          <button
            type="button"
            onClick={onQuitar}
            aria-label="Quitar plan de promoción"
            className="shrink-0 text-(--text-muted) hover:text-[#d52b1e] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-(--border) bg-(--bg-primary) px-4! py-3! text-sm font-semibold text-(--brand-cafe) transition-colors hover:border-(--brand-cafe)/50">
          <Paperclip size={16} />
          Adjuntar PDF
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onCambiar(file);
              e.target.value = '';
            }}
          />
        </label>
      )}
      <p className="text-xs text-(--text-muted) mt-1.5!">
        A ejecutar en caso de ser coronada — lo pide la convocatoria para esta categoría.
      </p>
    </div>
  );
}

export default function FormularioInscripcion() {
  // Ancla para "volver arriba" — apunta al inicio de ESTE componente, no al
  // top de la página entera, porque arriba del formulario ahora hay
  // secciones de diseño (Hero, banner) y hacer scroll a top:0 los pasaba de
  // largo cada vez que se cambiaba de paso.
  const inicioRef = useRef<HTMLDivElement>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [paso, setPaso] = useState(0);
  const [pasoMaximo, setPasoMaximo] = useState(0);
  const [enviado, setEnviado] = useState(false);
  // ID real que devuelve el backend al crear la inscripción — se imprime en
  // el docx de los anexos para que el equipo del festival pueda ubicar la
  // postulación exacta en el panel de administración.
  const [inscripcionId, setInscripcionId] = useState('');

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
  // Foto del carnet del adulto responsable — mismo patrón que Integrante/
  // Acompanante, pero es un solo bloque top-level porque solo hay un adulto
  // responsable por inscripción (no una lista).
  const [adultoResponsableFotos, setAdultoResponsableFotos] = useState<FotosCarnet>(crearFotosCarnetVacias());

  // Alternativa para categorías con muchos integrantes (Grupo/Estudiantina/
  // Autóctono): en vez de pedir anverso+reverso a cada persona (hasta 40
  // fotos de una sentada), por defecto se ofrece subir un solo archivo con
  // todos los carnets del grupo. Un toggle permite pasar al modo "uno por
  // persona" si el grupo prefiere hacerlo así.
  const [modoFotosGrupo, setModoFotosGrupo] = useState<'grupal' | 'individual'>('grupal');
  const [fotosCarnetsGrupal, setFotosCarnetsGrupal] = useState<File[]>([]);

  // Solo categoría Ñusta: PDF del "plan de promoción del festival" que la
  // convocatoria exige, a ejecutar en caso de ser coronada.
  const [planPromocion, setPlanPromocion] = useState<File | null>(null);

  // Anexo 1 (declaración de bases) + Anexo 3 (declaración voluntaria)
  const [aceptaBases, setAceptaBases] = useState(false);
  const [declaracionVoluntaria, setDeclaracionVoluntaria] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  // Aviso NO bloqueante si falla la subida de fotos después de que la
  // inscripción ya se guardó — no es un error fatal, la postulación existe
  // igual (ver enviar()).
  const [avisoFotos, setAvisoFotos] = useState('');
  // Modal que aparece apenas se confirma el envío, recordando que los
  // anexos se presentan impresos y firmados el día de la preselección.
  const [modalDocumentosAbierto, setModalDocumentosAbierto] = useState(false);
  // Una vez que se intenta avanzar/enviar con algo inválido, se resaltan los
  // campos con error en vez de solo bloquear el botón sin explicación.
  const [mostrarErrores, setMostrarErrores] = useState(false);

  const esComposicion = categoria === 'Composición';
  const esEspecial = categoria === 'Especial';
  const esNusta = categoria === 'Ñusta';
  // Pedido explícito: la foto de carnet es obligatoria en todas las
  // categorías menos Autóctono (grupos grandes, 8-20 integrantes, donde
  // reunir el carnet de todos de entrada es más difícil).
  const esAutoctono = categoria === 'Autóctono';
  const fotosCarnetObligatorias = !esAutoctono;
  // El texto oficial del Anexo 3 dice literal "(Omitir este punto para la
  // categoría: Especial)" — solo Especial, no Composición (aunque la
  // convocatoria sí permite profesionales en ambas categorías, el Anexo 3
  // solo exime a Especial de la declaración de "no soy profesional"; en su
  // lugar lleva la de exención de plagio/propiedad, que igual exige una
  // declaración — solo cambia el texto, no se omite el checkbox).
  const esExentoProfesional = esEspecial;

  const categoriaInfo = obtenerCategoriaInfo(categoria);
  const integrantesMin = categoriaInfo?.integrantesMin ?? 1;
  const integrantesMax = categoriaInfo?.integrantesMax ?? 1;
  const acompanantesMax = categoriaInfo?.acompanantesMax ?? 0;
  const edadMinima = categoriaInfo?.edadMinima ?? null;
  const edadMaxima = categoriaInfo?.edadMaxima ?? null;
  const esGrupal = integrantesMax > 1;
  // La documentación de Ñusta dice literal: "En caso de ser menor de edad,
  // una carta de autorización... *Anexo 4" — Ñusta va de 16 a 25 años, así
  // que una postulante de 16-17 SÍ es menor (mayoría de edad en Bolivia:
  // 18 años) aunque la categoría en sí no esté marcada como "infantil". Por
  // eso el adulto responsable no depende solo del flag fijo de la
  // categoría: también se activa si la fecha de nacimiento del postulante
  // (categorías individuales — en grupales, con varios integrantes, esto
  // queda pendiente, ver nota en el plan) indica que es menor al corte.
  const postulante = !esGrupal ? integrantes[0] : undefined;
  const postulanteEsMenorDeEdad =
    !!postulante?.fechaNacimiento && edadEnFecha(new Date(postulante.fechaNacimiento)) < 18;
  const requiereAdultoResponsable = (categoriaInfo?.requiereAdultoResponsable ?? false) || postulanteEsMenorDeEdad;
  // Categorías con muchos integrantes y sin otra complejidad (Grupo 4-8,
  // Estudiantina 8-15, Autóctono 8-20) — ahí se ofrece la opción de subir
  // un solo archivo con todos los carnets en vez de uno por persona. Dúo
  // (2) y Trío (3) quedan afuera: son pocas personas, no hace falta.
  const mostrarOpcionGrupal = esGrupal && integrantesMax >= 4;
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

  // Fotos de carnet: obligatorias salvo en Autóctono (ver fotosCarnetObligatorias
  // más arriba). Cuando el grupo eligió el modo "un solo archivo", alcanza con
  // que haya al menos uno subido; si no, cada integrante necesita anverso+reverso.
  const fotosIntegrantesCompletas =
    mostrarOpcionGrupal && modoFotosGrupo === 'grupal'
      ? fotosCarnetsGrupal.length > 0
      : integrantes.every((i) => i.fotoCiAnverso && i.fotoCiReverso);
  const fotosCarnetCompletas =
    !fotosCarnetObligatorias ||
    (fotosIntegrantesCompletas &&
      acompanantes.every((a) => a.fotoCiAnverso && a.fotoCiReverso) &&
      (!requiereAdultoResponsable ||
        (adultoResponsableFotos.fotoCiAnverso && adultoResponsableFotos.fotoCiReverso)));

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
          adultoResponsableCelular.trim() !== '')) &&
      fotosCarnetCompletas,
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
    if (fotosCarnetObligatorias) {
      if (mostrarOpcionGrupal && modoFotosGrupo === 'grupal') {
        if (fotosCarnetsGrupal.length === 0) {
          erroresPasoActual.push('Falta subir el archivo con los carnets del grupo.');
        }
      } else {
        integrantes.forEach((i, index) => {
          const etiqueta = esGrupal ? `Integrante ${index + 1}` : 'El postulante';
          if (!i.fotoCiAnverso || !i.fotoCiReverso) {
            erroresPasoActual.push(`${etiqueta}: falta la foto del carnet (anverso y reverso).`);
          }
        });
      }
      acompanantes.forEach((a, index) => {
        if (!a.fotoCiAnverso || !a.fotoCiReverso) {
          erroresPasoActual.push(`Acompañante ${index + 1}: falta la foto del carnet (anverso y reverso).`);
        }
      });
      if (requiereAdultoResponsable && (!adultoResponsableFotos.fotoCiAnverso || !adultoResponsableFotos.fotoCiReverso)) {
        erroresPasoActual.push('Falta la foto del carnet del adulto responsable (anverso y reverso).');
      }
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
    inicioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // Actualiza el anverso/reverso de la foto de una persona dentro de una
  // lista (integrantes o acompañantes) — revoca la URL de preview anterior
  // antes de crear la nueva, para no dejar object URLs sueltos en memoria.
  function actualizarFotoEnLista<T extends FotosCarnet & { id: string }>(
    lista: T[],
    id: string,
    lado: LadoFoto,
    file: File | null,
  ): T[] {
    return lista.map((item) => {
      if (item.id !== id) return item;
      if (lado === 'anverso') {
        revocarSiExiste(item.fotoCiAnversoPreviewUrl);
        return { ...item, fotoCiAnverso: file, fotoCiAnversoPreviewUrl: file ? URL.createObjectURL(file) : '' };
      }
      revocarSiExiste(item.fotoCiReversoPreviewUrl);
      return { ...item, fotoCiReverso: file, fotoCiReversoPreviewUrl: file ? URL.createObjectURL(file) : '' };
    });
  }

  const actualizarIntegranteFoto = (id: string, lado: LadoFoto, file: File) => {
    setIntegrantes((prev) => actualizarFotoEnLista(prev, id, lado, file));
  };
  const quitarIntegranteFoto = (id: string, lado: LadoFoto) => {
    setIntegrantes((prev) => actualizarFotoEnLista(prev, id, lado, null));
  };

  const actualizarAcompananteFoto = (id: string, lado: LadoFoto, file: File) => {
    setAcompanantes((prev) => actualizarFotoEnLista(prev, id, lado, file));
  };
  const quitarAcompananteFoto = (id: string, lado: LadoFoto) => {
    setAcompanantes((prev) => actualizarFotoEnLista(prev, id, lado, null));
  };

  const actualizarAdultoResponsableFoto = (lado: LadoFoto, file: File) => {
    setAdultoResponsableFotos((prev) => {
      if (lado === 'anverso') {
        revocarSiExiste(prev.fotoCiAnversoPreviewUrl);
        return { ...prev, fotoCiAnverso: file, fotoCiAnversoPreviewUrl: URL.createObjectURL(file) };
      }
      revocarSiExiste(prev.fotoCiReversoPreviewUrl);
      return { ...prev, fotoCiReverso: file, fotoCiReversoPreviewUrl: URL.createObjectURL(file) };
    });
  };
  const quitarAdultoResponsableFoto = (lado: LadoFoto) => {
    setAdultoResponsableFotos((prev) => {
      if (lado === 'anverso') {
        revocarSiExiste(prev.fotoCiAnversoPreviewUrl);
        return { ...prev, fotoCiAnverso: null, fotoCiAnversoPreviewUrl: '' };
      }
      revocarSiExiste(prev.fotoCiReversoPreviewUrl);
      return { ...prev, fotoCiReverso: null, fotoCiReversoPreviewUrl: '' };
    });
  };

  // Opción grupal (Grupo/Estudiantina/Autóctono): un solo archivo (o varios)
  // con todos los carnets juntos, en vez de uno por persona.
  const agregarFotosCarnetsGrupal = (files: FileList) => {
    setFotosCarnetsGrupal((prev) => [...prev, ...Array.from(files)]);
  };
  const quitarFotoCarnetGrupal = (index: number) => {
    setFotosCarnetsGrupal((prev) => prev.filter((_, i) => i !== index));
  };

  // Sube las fotos de carnet después de que la inscripción ya se creó (así
  // se tienen los IDs reales de cada Acompanante/GrupoIntegrante que Prisma
  // acaba de generar). No lanza — si algo falla, se avisa sin bloquear la
  // pantalla de éxito, porque la inscripción en sí ya quedó guardada.
  const subirFotosCarnet = async (apiUrl: string, tipo: 'cantante' | 'grupo', id: string, dataCreada: any) => {
    type Objetivo = { tipo: string; lado?: 'ANVERSO' | 'REVERSO'; id?: string };
    const objetivos: Objetivo[] = [];
    const archivos: File[] = [];

    const agregar = (objetivo: Objetivo, anverso: File | null, reverso: File | null) => {
      if (anverso) {
        objetivos.push({ ...objetivo, lado: 'ANVERSO' });
        archivos.push(anverso);
      }
      if (reverso) {
        objetivos.push({ ...objetivo, lado: 'REVERSO' });
        archivos.push(reverso);
      }
    };

    if (tipo === 'cantante') {
      const postulante = integrantes[0];
      if (postulante) agregar({ tipo: 'POSTULANTE' }, postulante.fotoCiAnverso, postulante.fotoCiReverso);

      const acompanantesCreados: Array<{ id: string }> = dataCreada?.acompanantes ?? [];
      acompanantes.forEach((acompanante, index) => {
        const creado = acompanantesCreados[index];
        if (creado) agregar({ tipo: 'ACOMPANANTE', id: creado.id }, acompanante.fotoCiAnverso, acompanante.fotoCiReverso);
      });

      if (requiereAdultoResponsable) {
        agregar({ tipo: 'ADULTO_RESPONSABLE' }, adultoResponsableFotos.fotoCiAnverso, adultoResponsableFotos.fotoCiReverso);
      }
    } else if (modoFotosGrupo === 'individual') {
      const integrantesCreados: Array<{ id: string }> = dataCreada?.integrantes ?? [];
      integrantes.forEach((integrante, index) => {
        const creado = integrantesCreados[index];
        if (creado) agregar({ tipo: 'INTEGRANTE', id: creado.id }, integrante.fotoCiAnverso, integrante.fotoCiReverso);
      });
    } else {
      fotosCarnetsGrupal.forEach((file) => {
        objetivos.push({ tipo: 'GRUPO_CARNETS_BULK' });
        archivos.push(file);
      });
    }

    if (archivos.length === 0) return;

    const formData = new FormData();
    formData.append('objetivos', JSON.stringify(objetivos));
    archivos.forEach((file) => formData.append('fotos', file));

    try {
      const resFotos = await fetch(`${apiUrl}/inscripciones/${tipo}/${id}/fotos`, { method: 'POST', body: formData });
      if (!resFotos.ok) {
        setAvisoFotos(
          'Tu inscripción quedó registrada, pero hubo un problema subiendo las fotos del carnet. El equipo del festival te contactará para completarlas.',
        );
      }
    } catch {
      setAvisoFotos(
        'Tu inscripción quedó registrada, pero no se pudieron subir las fotos del carnet por un problema de conexión. El equipo del festival te contactará para completarlas.',
      );
    }
  };

  const subirPlanPromocionNusta = async (apiUrl: string, id: string) => {
    if (!planPromocion) return;

    const formData = new FormData();
    formData.append('archivo', planPromocion);

    try {
      const res = await fetch(`${apiUrl}/inscripciones/cantante/${id}/plan-promocion`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        setAvisoFotos(
          'Tu inscripción quedó registrada, pero hubo un problema subiendo el plan de promoción. El equipo del festival te contactará para completarlo.',
        );
      }
    } catch {
      setAvisoFotos(
        'Tu inscripción quedó registrada, pero no se pudo subir el plan de promoción por un problema de conexión. El equipo del festival te contactará para completarlo.',
      );
    }
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

    const dataCreada = await res.json().catch(() => null);
    if (dataCreada?.id) {
      setInscripcionId(dataCreada.id);
      await subirFotosCarnet(apiUrl, esGrupal ? 'grupo' : 'cantante', dataCreada.id, dataCreada);
      if (esNusta) await subirPlanPromocionNusta(apiUrl, dataCreada.id);
    }

    setEnviado(true);
    setModalDocumentosAbierto(true);
    scrollArriba();
    setEnviando(false);
  };

  const descargarDocx = () => {
    generarInscripcionDocx({
      id: inscripcionId,
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
    <div ref={inicioRef} className="container form-inscripcion-cafe">
      {/* Encabezado */}
      <header className="pt-10! pb-10! md:pt-14! md:pb-12! max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-3!">Formulario de Inscripción</h1>
        <p className='font-barlow mt-3 max-w-2xl text-xl! leading-relaxed text-(--brand-cafe)'>
          Completa los datos de tu postulación al XXXIII Festival Nacional de la Canción Boliviana
          “Aquí… Canta Bolivia”. Este formulario reúne la Ficha de Postulación, la Carta de
          Presentación y la Declaración Voluntaria de los anexos de la convocatoria.
        </p>
      </header>

      {!enviado && !mostrarFormulario && (
        <section className="flex flex-col gap-8 mb-16!">
          {/* Video tutorial (placeholder hasta tener el video real) + descarga
              de la convocatoria en PDF (ya con el link de Drive). */}
          <div className="grid lg:grid-cols-[2fr_1fr] gap-4 max-w-4xl w-full mx-auto items-stretch">
            <div
              className={`${panelClass} min-h-64 flex flex-col items-center justify-center gap-3 p-6!`}
            >
              <TelonDecor />
              <div className="w-16 h-16 rounded-full bg-(--brand-cafe)/10 flex items-center justify-center text-(--brand-cafe)">
                <PlayCircle size={32} />
              </div>
              <p className="font-bakbak font-black text-black">Video tutorial próximamente</p>
              <p className="text-(--brand-cafe)/70 text-sm text-center max-w-sm">
                Acá vas a encontrar un video explicando cómo completar tu inscripción paso a paso.
              </p>
            </div>

            <div className="flex flex-col gap-10">
              <a
                href={CONVOCATORIA_URL || undefined}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (!CONVOCATORIA_URL) e.preventDefault();
                }}
                aria-disabled={!CONVOCATORIA_URL}
                className={`${panelClass} flex flex-1 flex-col items-center justify-center gap-3 p-6! text-center transition-all duration-300 ${
                  CONVOCATORIA_URL ? 'hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
                }`}
              >
                <TelonDecor />
                <div className="w-16 h-16 rounded-full bg-[#2e7d46]/10 flex items-center justify-center text-[#2e7d46]">
                  <FileDown size={28} />
                </div>
                <p className="font-bakbak font-black text-black">Descargar convocatoria</p>
                <p className="text-(--brand-cafe)/70 text-sm max-w-45">
                  {CONVOCATORIA_URL ? 'PDF con las bases completas.' : 'Enlace próximamente.'}
                </p>
              </a>

              {/* Anexos 1-4 en blanco, tal como los trae la convocatoria
                  oficial — para quien prefiera postular en físico, a mano,
                  sin usar este formulario digital. */}
              <a
                href="/documentos/Convocatoria-y-Anexos-2026.docx"
                download
                className={`${panelClass} flex flex-1 flex-col items-center justify-center gap-3 p-6! text-center transition-all duration-300 hover:-translate-y-0.5 cursor-pointer`}
              >
                <TelonDecor />
                <div className="w-16 h-16 rounded-full bg-(--brand-cafe)/10 flex items-center justify-center text-(--brand-cafe)">
                  <FileText size={28} />
                </div>
                <p className="font-bakbak font-black text-black">Descargar anexos</p>
                <p className="text-(--brand-cafe)/70 text-sm max-w-45">Para llenar a mano, sin el formulario digital.</p>
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMostrarFormulario(true);
              scrollArriba();
            }}
            className="inline-flex items-center gap-2 self-center px-8! py-3.5! rounded-lg font-semibold text-white bg-[#534741] shadow-md shadow-[#d52b1e]/25 transition-all duration-300 hover:bg-[#3b2b23] hover:-translate-y-0.5 cursor-pointer"
          >
            Iniciar inscripción <ArrowRight size={18} />
          </button>
        </section>
      )}

      {enviado ? (
        <>
          <div className="relative mb-16! overflow-hidden rounded-2xl bg-(--brand-negro) p-3! sm:p-4!">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />
            <section className={`${panelClass} p-8! md:p-12! flex flex-col items-center text-center gap-4`}>
              <div className="w-16 h-16 rounded-full bg-[#2e7d46]/12 border border-[#2e7d46]/35 flex items-center justify-center text-[#2e7d46]">
                <Check size={32} />
              </div>
              <h2 className="font-bakbak text-2xl font-black text-black">¡Postulación enviada!</h2>
              <p className="text-(--brand-cafe) max-w-lg">
                Tu inscripción a la categoría <strong className="text-black">{categoria}</strong> con{' '}
                {integrantes.length} integrante{integrantes.length > 1 ? 's' : ''} quedó registrada y
                está pendiente de revisión por el comité organizador. Guarda una copia de los anexos
                para presentarlos firmados.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4!">
                <button
                  onClick={descargarDocx}
                  className="inline-flex items-center gap-2 px-6! py-3! rounded-lg font-semibold text-white bg-[#534741] shadow-md shadow-[#d52b1e]/25 transition-all duration-300 hover:bg-[#3b2b23] hover:-translate-y-0.5 cursor-pointer"
                >
                  <Download size={16} /> Descargar anexos en Word
                </button>
              </div>
              <p className="text-(--text-muted) text-xs max-w-lg">
                El Word incluye la Ficha de Postulación (Anexo 1) y, por cada integrante, su propia Carta
                de Presentación (Anexo 2) y Declaración Voluntaria (Anexo 3), ya que estos dos anexos son
                personales. Las firmas quedan en blanco para completarlas a mano.
              </p>
              {avisoFotos && (
                <div className="w-full max-w-lg rounded-lg border border-[#e08f1f]/30 bg-[#e08f1f]/8 px-4! py-3! text-sm text-[#8a5a12]">
                  {avisoFotos}
                </div>
              )}
            </section>
          </div>

          {modalDocumentosAbierto && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4!"
              onClick={() => setModalDocumentosAbierto(false)}
            >
              <div
                className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6! text-center shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />
                <div className="mx-auto mb-3! flex h-14 w-14 items-center justify-center rounded-full bg-[#d52b1e]/10 text-[#d52b1e]">
                  <FileText size={26} />
                </div>
                <h3 className="font-bakbak mb-2! text-lg font-black text-black">Importante</h3>
                <p className="mb-4! text-sm leading-relaxed text-(--brand-cafe)">
                  Todos estos documentos (Anexos 1 al 4) deben presentarse <strong>impresos y firmados</strong> el
                  día de la preselección departamental
                  {FECHA_PRESELECCION ? (
                    <>
                      , <strong>{FECHA_PRESELECCION}</strong>
                    </>
                  ) : (
                    ', en la fecha que se coordine con los encargados del festival en tu departamento'
                  )}
                  . Por favor, descargá los documentos correspondientes con el botón "Descargar anexos en Word"
                  al final de esta pantalla.
                </p>
                <button
                  type="button"
                  onClick={() => setModalDocumentosAbierto(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#534741] px-6! py-2.5! text-sm font-semibold text-white transition-colors hover:bg-[#3b2b23] cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}
        </>
      ) : mostrarFormulario ? (
        <>
          {/* Stepper */}
          <nav className="mb-8!">
            <div className="hidden lg:flex items-center justify-between">
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
                            ? 'bg-(--brand-cafe) border-(--brand-cafe) text-white shadow-[0_0_0_4px_rgba(83,71,65,0.15)]'
                            : completado
                              ? 'bg-[#2e7d46]/12 border-[#2e7d46]/50 text-[#2e7d46]'
                              : 'bg-(--brand-crema) border-(--brand-cafe)/25 text-(--brand-cafe)/70'
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

            {/* Versión móvil/tablet: barra de progreso simple */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between mb-2!">
                <span className="text-sm font-semibold text-(--text-primary)">
                  Paso {paso + 1} de {PASOS.length}: {PASOS[paso].titulo}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-(--border) overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-(--brand-cafe) to-[#d52b1e] transition-all duration-300"
                  style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
                />
              </div>
            </div>
          </nav>

          <p className="mb-6! text-xs text-(--brand-cafe)/70">
            * Los espacios marcados con asterisco son obligatorios.
          </p>

          {/* Contenido del paso — marco negro con franja tricolor arriba,
              recreado en CSS (a partir de FRAV-08.png como referencia) en
              vez de estirar el PNG, para que se vea igual sin importar la
              altura del paso. El panel blanco de panelClass queda inset
              adentro, por eso acá no se usa <TelonDecor />, para no repetir
              la franja de colores. En mobile se saca el margen negro (no
              hay espacio de sobra ahí) y queda solo la franja de color
              pegada arriba del panel; el marco completo vuelve desde sm. */}
          <div className="relative mb-6! overflow-hidden rounded-2xl sm:bg-(--brand-negro) sm:p-4!">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />
            <section className={`${panelClass} p-6! sm:p-8! md:p-12!`}>
              {/* Paso 0: Categoría */}
            {paso === 0 && (
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="font-bakbak text-xl font-black text-black mb-1!">¿En qué categoría postulas?</h2>
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
                                ? 'bg-(--brand-cafe)/10 border-(--brand-cafe)/60 text-(--brand-cafe) shadow-[0_0_0_3px_rgba(83,71,65,0.12)]'
                                : 'bg-(--bg-primary) border-(--border) text-(--text-secondary) hover:border-(--brand-cafe)/35 hover:bg-(--brand-cafe)/5'
                            }`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                                  seleccionado ? 'border-(--brand-cafe) bg-(--brand-cafe)' : 'border-(--border)'
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
                  <h2 className="font-bakbak text-xl font-black text-black mb-1!">Datos de la obra</h2>
                  <p className="text-(--text-secondary) text-sm">Información del tema con el que postulas.</p>
                </div>

                {esComposicion && (
                  <div className="rounded-lg border border-(--brand-cafe)/25 bg-(--brand-cafe)/8 px-4! py-3! flex gap-3 items-start">
                    <Info size={18} className="text-(--brand-cafe) shrink-0 mt-0.5!" />
                    <p className="text-sm text-(--brand-cafe)">
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
                  <h2 className="font-bakbak text-xl font-black text-black mb-1!">Datos del postulante</h2>
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
                    <h2 className="font-bakbak text-xl font-black text-black mb-1!">
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
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--brand-cafe) hover:text-(--brand-negro) disabled:text-(--text-muted) disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Plus size={16} /> Agregar integrante
                    </button>
                  )}
                </div>

                {mostrarOpcionGrupal && (
                  <div className="rounded-xl border border-(--border) bg-(--bg-primary) p-5!">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-(--text-primary) mb-1!">
                          Carnets del grupo{' '}
                          {fotosCarnetObligatorias ? (
                            <span className="text-[#d52b1e]">*</span>
                          ) : (
                            <span className="font-normal text-(--text-muted)">(recomendado)</span>
                          )}
                        </h3>
                        <p className="text-(--text-secondary) text-sm">
                          {modoFotosGrupo === 'grupal'
                            ? 'Subí una foto o PDF con los carnets de todo el grupo (anverso y reverso) — la forma más rápida cuando hay muchos integrantes.'
                            : 'Subí el anverso y reverso del carnet de cada integrante, en su propia tarjeta más abajo.'}
                        </p>
                      </div>
                      <label className="inline-flex shrink-0 cursor-pointer select-none items-center gap-1.5 text-sm font-semibold text-(--brand-cafe)">
                        <input
                          type="checkbox"
                          checked={modoFotosGrupo === 'individual'}
                          onChange={(e) => setModoFotosGrupo(e.target.checked ? 'individual' : 'grupal')}
                          className="h-4 w-4 cursor-pointer accent-(--brand-cafe)"
                        />
                        Prefiero subir uno por persona
                      </label>
                    </div>

                    {modoFotosGrupo === 'grupal' && (
                      <div className="mt-4! flex flex-col gap-3">
                        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-(--brand-cafe)/40 px-4! py-2.5! text-sm font-semibold text-(--brand-cafe) transition-colors hover:border-(--brand-cafe)/60">
                          <Paperclip size={16} /> Agregar archivo(s)
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) agregarFotosCarnetsGrupal(e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        {fotosCarnetsGrupal.length > 0 && (
                          <ul className="flex flex-col gap-1.5">
                            {fotosCarnetsGrupal.map((file, index) => (
                              <li
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between gap-2 rounded-lg border border-(--border) bg-white px-3! py-2! text-sm text-(--text-secondary)"
                              >
                                <span className="truncate">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => quitarFotoCarnetGrupal(index)}
                                  className="shrink-0 cursor-pointer text-(--text-muted) transition-colors hover:text-[#d52b1e]"
                                  aria-label={`Quitar ${file.name}`}
                                >
                                  <X size={14} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        {mostrarErrores && fotosCarnetObligatorias && fotosCarnetsGrupal.length === 0 && (
                          <p className="text-xs text-[#d52b1e] font-medium">
                            Falta subir el archivo con los carnets del grupo.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

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
                            <div className="w-20 shrink-0">
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
                        {(!mostrarOpcionGrupal || modoFotosGrupo === 'individual') && (
                          <CampoFotoCarnet
                            fotos={integrante}
                            onCambiar={(lado, file) => actualizarIntegranteFoto(integrante.id, lado, file)}
                            onQuitar={(lado) => quitarIntegranteFoto(integrante.id, lado)}
                            obligatorio={fotosCarnetObligatorias}
                            error={
                              mostrarErrores &&
                              fotosCarnetObligatorias &&
                              (!integrante.fotoCiAnverso || !integrante.fotoCiReverso)
                            }
                          />
                        )}
                        {esNusta && (
                          <CampoArchivoPdf
                            archivo={planPromocion}
                            onCambiar={setPlanPromocion}
                            onQuitar={() => setPlanPromocion(null)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {integrantesMax > integrantesMin && (
                    <button
                      type="button"
                      onClick={agregarIntegrante}
                      disabled={integrantes.length >= integrantesMax}
                      className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-(--brand-cafe) hover:text-(--brand-negro) disabled:text-(--text-muted) disabled:cursor-not-allowed transition-colors cursor-pointer rounded-xl border border-dashed border-(--brand-cafe)/40 hover:border-(--brand-cafe)/60 disabled:border-(--border) py-3! self-stretch"
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
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--brand-cafe) hover:text-(--brand-negro) disabled:text-(--text-muted) disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                          <CampoFotoCarnet
                            fotos={acompanante}
                            onCambiar={(lado, file) => actualizarAcompananteFoto(acompanante.id, lado, file)}
                            onQuitar={(lado) => quitarAcompananteFoto(acompanante.id, lado)}
                            obligatorio={fotosCarnetObligatorias}
                            error={
                              mostrarErrores &&
                              fotosCarnetObligatorias &&
                              (!acompanante.fotoCiAnverso || !acompanante.fotoCiReverso)
                            }
                          />
                        </div>
                      </div>
                    ))}
                    {acompanantes.length < acompanantesMax && (
                      <button
                        type="button"
                        onClick={agregarAcompanante}
                        className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-(--brand-cafe) hover:text-(--brand-negro) transition-colors cursor-pointer rounded-xl border border-dashed border-(--brand-cafe)/40 hover:border-(--brand-cafe)/60 py-3! self-stretch"
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
                        <CampoFotoCarnet
                          fotos={adultoResponsableFotos}
                          onCambiar={actualizarAdultoResponsableFoto}
                          onQuitar={quitarAdultoResponsableFoto}
                          obligatorio={fotosCarnetObligatorias}
                          error={
                            mostrarErrores &&
                            fotosCarnetObligatorias &&
                            (!adultoResponsableFotos.fotoCiAnverso || !adultoResponsableFotos.fotoCiReverso)
                          }
                        />
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
                  <h2 className="font-bakbak text-xl font-black text-black mb-1!">Revisa y confirma</h2>
                  <p className="text-(--text-secondary) text-sm">
                    Revisa que todos los datos sean correctos antes de enviar — no podrás editarlos
                    después de la revisión del comité organizador.
                  </p>
                </div>

                <div className="rounded-xl border border-(--border) bg-(--bg-primary) p-5!">
                  <h3 className="text-sm font-bold text-(--text-secondary) mb-4! flex items-center gap-2">
                    <Sparkles size={15} className="text-(--brand-cafe)" /> Resumen de tu postulación
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
                    <summary className="flex items-center gap-2 cursor-pointer list-none px-4! py-3! text-sm font-semibold text-(--brand-cafe) hover:bg-(--brand-cafe)/5 transition-colors">
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
                      : 'border-(--border) bg-(--bg-primary) hover:border-(--brand-cafe)/35'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={aceptaBases}
                    onChange={(e) => setAceptaBases(e.target.checked)}
                    className="mt-1! w-4 h-4 accent-(--brand-cafe) shrink-0 cursor-pointer"
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
                      : 'border-(--border) bg-(--bg-primary) hover:border-(--brand-cafe)/35'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={declaracionVoluntaria}
                    onChange={(e) => setDeclaracionVoluntaria(e.target.checked)}
                    className="mt-1! w-4 h-4 accent-(--brand-cafe) shrink-0 cursor-pointer"
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
                        : 'border-(--border) bg-(--bg-primary) hover:border-(--brand-cafe)/35'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={autorizaAdultoResponsable}
                      onChange={(e) => setAutorizaAdultoResponsable(e.target.checked)}
                      className="mt-1! w-4 h-4 accent-(--brand-cafe) shrink-0 cursor-pointer"
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
          </div>

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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-16!">
            <button
              type="button"
              onClick={anterior}
              disabled={paso === 0}
              className="inline-flex items-center gap-1.5 px-5! py-2.5! rounded-lg font-semibold text-black bg-white border border-black hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                className={`inline-flex items-center gap-1.5 px-6! py-3! rounded-lg font-semibold text-white bg-[#534741] shadow-md shadow-[#d52b1e]/25 transition-all duration-300 cursor-pointer ${
                  puedeAvanzar ? 'hover:bg-[#3b2b23] hover:-translate-y-0.5' : 'opacity-30'
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
                className={`inline-flex items-center gap-1.5 px-6! py-3! rounded-lg font-semibold text-white bg-[#534741] shadow-md shadow-[#d52b1e]/25 transition-all duration-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer ${
                  formularioCompleto && !enviando ? 'hover:bg-[#3b2b23] hover:-translate-y-0.5' : 'opacity-30'
                }`}
              >
                <Send size={16} /> {enviando ? 'Enviando…' : 'Enviar inscripción'}
              </button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

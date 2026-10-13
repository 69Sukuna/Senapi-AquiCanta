import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { getDepartamentoInfo } from '@/lib/departamentos';
import { ESTADOS_INSCRIPCION } from '@/lib/estadoInscripcion';
import type { Inscrito } from './tipos';

const formateadorFecha = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/La_Paz',
});

const formateadorFechaHora = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/La_Paz',
});

// Canción adicional de una Ñusta (GET /lista-niusta) — solo lo que se imprime.
export interface CancionNiustaExport {
  cantanteId: string;
  orden: number;
  tituloTema: string;
  autorCompositor: string;
}

type Celda = string | string[];

// Encabezado y ancho relativo (en %) de cada columna — la hoja va apaisada
// para que entren todas sin cortar nombres largos. Una celda con varias
// líneas (string[]) se imprime un párrafo por línea.
function columnas(cancionesNiusta: Map<string, CancionNiustaExport[]>) {
  // Ñusta con canciones adicionales: título y autor se listan numerados,
  // una canción por línea (la 1 es la principal de la inscripción).
  const repertorio = (x: Inscrito) => {
    const extra = x.tipo === 'CANTANTE' ? (cancionesNiusta.get(x.id) ?? []) : [];
    if (extra.length === 0) return null;
    return [{ orden: 1, tituloTema: x.tituloTema || '—', autorCompositor: x.autorCompositor || '—' }, ...extra];
  };

  const lista: { titulo: string; ancho: number; valor: (inscrito: Inscrito, indice: number) => Celda }[] = [
    { titulo: 'N°', ancho: 4, valor: (_, i) => String(i + 1) },
    { titulo: 'Nombre', ancho: 16, valor: (x) => (x.pseudonimo ? `${x.nombre} ("${x.pseudonimo}")` : x.nombre) },
    { titulo: 'Categoría', ancho: 13, valor: (x) => x.categoria.nombre },
    { titulo: 'Tipo', ancho: 7, valor: (x) => (x.tipo === 'CANTANTE' ? 'Individual' : 'Grupal') },
    { titulo: 'Departamento', ancho: 9, valor: (x) => getDepartamentoInfo(x.departamento)?.label ?? '—' },
    {
      titulo: 'Título del tema',
      ancho: 14,
      valor: (x) => repertorio(x)?.map((c) => `${c.orden}. ${c.tituloTema}`) ?? (x.tituloTema || '—'),
    },
    {
      titulo: 'Autor / Compositor',
      ancho: 12,
      valor: (x) => repertorio(x)?.map((c) => `${c.orden}. ${c.autorCompositor}`) ?? (x.autorCompositor || '—'),
    },
    { titulo: 'Celular', ancho: 8, valor: (x) => x.celular1 || '—' },
    { titulo: 'Estado', ancho: 9, valor: (x) => ESTADOS_INSCRIPCION[x.estado].label },
    { titulo: 'Inscrito', ancho: 8, valor: (x) => formateadorFecha.format(new Date(x.createdAt)) },
  ];
  return lista;
}

const BORDE = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' };
const BORDES_CELDA = { top: BORDE, bottom: BORDE, left: BORDE, right: BORDE };

function celda(contenido: Celda, ancho: number, encabezado = false) {
  const lineas = Array.isArray(contenido) ? contenido : [contenido];
  return new TableCell({
    width: { size: ancho, type: WidthType.PERCENTAGE },
    borders: BORDES_CELDA,
    shading: encabezado ? { type: ShadingType.CLEAR, color: 'auto', fill: '1B1B1B' } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: lineas.map(
      (texto) =>
        new Paragraph({
          children: [new TextRun({ text: texto, bold: encabezado, color: encabezado ? 'FFFFFF' : undefined, size: 17 })],
        }),
    ),
  });
}

// Genera y descarga un .docx con la lista de inscritos tal como se ve en el
// panel (mismos filtros y mismo orden). `filtros` es un resumen legible de
// los filtros activos para que el documento impreso diga qué contiene, y
// `cancionesNiusta` (cantanteId → canciones 2..7) completa el repertorio de
// cada Ñusta.
export async function exportarInscritosDocx(
  inscritos: Inscrito[],
  filtros: string[],
  cancionesNiusta: Map<string, CancionNiustaExport[]> = new Map(),
) {
  const COLUMNAS = columnas(cancionesNiusta);
  const tabla = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: COLUMNAS.map((c) => celda(c.titulo, c.ancho, true)),
      }),
      ...inscritos.map(
        (inscrito, i) =>
          new TableRow({
            cantSplit: true,
            children: COLUMNAS.map((c) => celda(c.valor(inscrito, i), c.ancho)),
          }),
      ),
    ],
  });

  const documento = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 20 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'AQUÍ CANTA BOLIVIA 2026', bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: 'Lista de inscritos', bold: true, size: 24 })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Filtros: ', bold: true, size: 18 }),
              new TextRun({ text: filtros.length > 0 ? filtros.join(' · ') : 'Ninguno (todos los inscritos)', size: 18 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: 'Total: ', bold: true, size: 18 }),
              new TextRun({ text: `${inscritos.length}`, size: 18 }),
              new TextRun({ text: '   ·   Generado el ', bold: true, size: 18 }),
              new TextRun({ text: formateadorFechaHora.format(new Date()), size: 18 }),
            ],
          }),
          tabla,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(documento);
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `inscritos-aqui-canta-bolivia-${new Date().toISOString().slice(0, 10)}.docx`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

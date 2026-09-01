import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Tab,
  TabStopType,
  TableBorders,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  VerticalMergeType,
  WidthType,
} from 'docx';

export interface IntegranteInscripcion {
  nombre: string;
  ciNumero: string;
  ciExtension: string;
  edad: string;
  whatsapp: string;
  direccion: string;
  instrumento: string;
}

export interface DatosInscripcion {
  categoria: string;
  nombrePostulante: string;
  pseudonimo: string;
  tituloTema: string;
  autorCompositor: string;
  ritmo: string;
  tiempo: string;
  videoUrl: string;
  departamento: string;
  celular1: string;
  celular2: string;
  integrantes: IntegranteInscripcion[];
  aceptaBases: boolean;
  declaracionVoluntaria: boolean;
}

const FESTIVAL = 'XXXIII Festival Nacional de la Canción Boliviana “Aquí… Canta Bolivia”';
const TAB_MEDIO = 4800;

// Igual a las tres columnas de categorías del Anexo 1 original (tabla real, no texto).
const CATEGORIAS_COL1 = [
  'Ñusta',
  'Solista vocal',
  'Solista instrumental – Armónico',
  'Solista instrumental – Melódico',
];
const CATEGORIAS_COL2 = ['Dúo vocal instrumental', 'Trío vocal instrumental', 'Grupo vocal instrumental', 'Estudiantina', 'Autóctono'];
const CATEGORIAS_COL3 = ['Composición', 'Solista vocal infantil', 'Solista instrumental infantil', 'Especial'];

function bordes(grosor: number) {
  const borde = { style: BorderStyle.SINGLE, size: grosor, color: '000000' } as const;
  return { top: borde, bottom: borde, left: borde, right: borde, insideHorizontal: borde, insideVertical: borde };
}

function ciCompleto(i: IntegranteInscripcion) {
  const numero = i.ciNumero.trim() || '—';
  return i.ciExtension.trim() ? `${numero}-${i.ciExtension.trim()}` : numero;
}

function fechaLarga() {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}

function tituloAnexo(numero: number, subtitulo: string, tamanoTitulo: number, nota?: string): Paragraph[] {
  const parrafos = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
      children: [new TextRun({ text: `ANEXO ${numero}`, bold: true, italics: true, font: 'Arial', size: tamanoTitulo })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: nota ? 40 : 240 },
      children: [new TextRun({ text: subtitulo, bold: true, underline: { type: UnderlineType.SINGLE } })],
    }),
  ];
  if (nota) {
    parrafos.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: nota, italics: true, size: 18, color: '595959' })],
      }),
    );
  }
  return parrafos;
}

function parrafo(
  texto: string,
  opciones: {
    bold?: boolean;
    italics?: boolean;
    after?: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  } = {},
) {
  return new Paragraph({
    spacing: { after: opciones.after ?? 160 },
    alignment: opciones.align,
    children: [new TextRun({ text: texto, bold: opciones.bold, italics: opciones.italics })],
  });
}

function encabezadoSeccion(texto: string) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text: `•  ${texto}`, bold: true })],
  });
}

function campoConTab(labelA: string, valorA: string, labelB?: string, valorB?: string) {
  const children = [
    new TextRun({ text: `${labelA}: `, bold: true }),
    new TextRun({ text: valorA || '—' }),
  ];
  if (labelB) {
    children.push(
      new TextRun({ children: [new Tab()] }),
      new TextRun({ text: `${labelB}: `, bold: true }),
      new TextRun({ text: valorB || '—' }),
    );
  }
  return new Paragraph({
    tabStops: [{ type: TabStopType.LEFT, position: TAB_MEDIO }],
    spacing: { after: 160 },
    children,
  });
}

function marcaCategoria(categoria: string, seleccionada: string) {
  const marcado = categoria === seleccionada;
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: `${marcado ? '●' : '○'}  ${categoria}`, bold: marcado, size: 18 })],
  });
}

function tablaCategorias(seleccionada: string) {
  const filas = Math.max(CATEGORIAS_COL1.length, CATEGORIAS_COL2.length, CATEGORIAS_COL3.length);
  const anchos = [2682, 2977, 3119];
  const rows: TableRow[] = [];
  for (let i = 0; i < filas; i++) {
    const celda = (categoria: string | undefined, ancho: number) =>
      new TableCell({
        width: { size: ancho, type: WidthType.DXA },
        children: [categoria ? marcaCategoria(categoria, seleccionada) : new Paragraph('')],
      });
    rows.push(
      new TableRow({
        children: [celda(CATEGORIAS_COL1[i], anchos[0]), celda(CATEGORIAS_COL2[i], anchos[1]), celda(CATEGORIAS_COL3[i], anchos[2])],
      }),
    );
  }
  return new Table({ width: { size: 8778, type: WidthType.DXA }, borders: TableBorders.NONE, rows });
}

function celdaEncabezadoGrande(texto: string, ancho: number, span = 1) {
  return new TableCell({
    width: { size: ancho, type: WidthType.DXA },
    columnSpan: span,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: texto, bold: true, font: 'Arial' })],
      }),
    ],
  });
}

function tablaDeclaracionEIntegrantes(integrantes: IntegranteInscripcion[]) {
  const anchos = [461, 4329, 1843, 1304, 1843];
  const anchoTotal = anchos.reduce((a, b) => a + b, 0);

  const filaDeclaracionTitulo = new TableRow({
    children: [celdaEncabezadoGrande('DECLARACIÓN', anchoTotal, 5)],
  });

  const filaDeclaracionTexto = new TableRow({
    children: [
      new TableCell({
        width: { size: anchoTotal, type: WidthType.DXA },
        columnSpan: 5,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Declaro y acepto expresamente las bases y condiciones de la convocatoria del ${FESTIVAL}.`,
                italics: true,
                font: 'Arial',
                size: 16,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const encabezados = ['N°', 'NOMBRES Y APELLIDOS', 'C.I.', 'EDAD', 'FIRMA'];
  const filaEncabezado = new TableRow({
    children: encabezados.map((texto, i) => celdaEncabezadoGrande(texto, anchos[i])),
  });

  const filasDatos = integrantes.map(
    (integrante, index) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: anchos[0], type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(String(index + 1))] })],
          }),
          new TableCell({
            width: { size: anchos[1], type: WidthType.DXA },
            children: [new Paragraph(integrante.nombre || '—')],
          }),
          new TableCell({
            width: { size: anchos[2], type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(ciCompleto(integrante))] })],
          }),
          new TableCell({
            width: { size: anchos[3], type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(integrante.edad || '—')] })],
          }),
          new TableCell({
            width: { size: anchos[4], type: WidthType.DXA },
            children: [new Paragraph('')],
          }),
        ],
      }),
  );

  return new Table({
    width: { size: anchoTotal, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    borders: bordes(24),
    rows: [filaDeclaracionTitulo, filaDeclaracionTexto, filaEncabezado, ...filasDatos],
  });
}

function lineaPuntos() {
  return new Paragraph({
    spacing: { after: 0, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: '……………………………………', bold: true })],
  });
}

function bloqueFirma(): Paragraph[] {
  return [
    parrafo('Atentamente,', { after: 160 }),
    new Paragraph({ spacing: { after: 160 } }),
    new Paragraph({ spacing: { after: 160 } }),
    lineaPuntos(),
    parrafo('FIRMA', { bold: true, after: 0, align: AlignmentType.CENTER }),
    new Paragraph({ spacing: { after: 0 } }),
    lineaPuntos(),
    parrafo('N° de Carnet de Identidad', { bold: true, after: 0, align: AlignmentType.CENTER }),
  ];
}

function construirAnexo1(datos: DatosInscripcion): (Paragraph | Table)[] {
  const contenido: (Paragraph | Table)[] = [...tituloAnexo(1, 'FICHA DE POSTULACIÓN', 32)];

  contenido.push(encabezadoSeccion('DATOS GENERALES:'));
  contenido.push(
    campoConTab(
      'NOMBRE',
      datos.nombrePostulante,
      'PSEUDÓNIMO',
      datos.categoria === 'Composición' ? datos.pseudonimo : 'N/A',
    ),
  );
  contenido.push(campoConTab('TÍTULO DEL TEMA', datos.tituloTema, 'AUTOR / COMPOSITOR', datos.autorCompositor));
  contenido.push(campoConTab('RITMO', datos.ritmo, 'TIEMPO', datos.tiempo ? `${datos.tiempo} minutos` : '—'));
  contenido.push(campoConTab('VIDEO', datos.videoUrl || '—'));
  contenido.push(new Paragraph({ spacing: { after: 120 } }));

  contenido.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: 'CATEGORÍA: (Marque en el círculo, una sola categoría)', bold: true })],
    }),
  );
  contenido.push(tablaCategorias(datos.categoria));
  contenido.push(new Paragraph({ spacing: { after: 160 } }));

  contenido.push(encabezadoSeccion('DATOS DEL POSTULANTE:'));
  contenido.push(parrafo(`DEPARTAMENTO: ${datos.departamento || '—'}`, { bold: false, after: 160 }));
  contenido.push(parrafo('CONTACTOS (CELULAR):', { bold: true, after: 60 }));
  contenido.push(parrafo(`1. ${datos.celular1 || '—'}`, { after: 60 }));
  contenido.push(parrafo(`2. ${datos.celular2 || '—'}`, { after: 240 }));

  contenido.push(tablaDeclaracionEIntegrantes(datos.integrantes));

  contenido.push(new Paragraph({ spacing: { after: 160 } }));
  contenido.push(parrafo(`FECHA: Oruro, ${fechaLarga()}`, { align: AlignmentType.CENTER, after: 60 }));
  contenido.push(
    parrafo('Aclaración: este formulario deberá ser presentado para la inscripción', {
      italics: true,
      align: AlignmentType.CENTER,
      after: 40,
    }),
  );
  contenido.push(parrafo('ORURO – BOLIVIA', { align: AlignmentType.CENTER }));

  return contenido;
}

function tablaDatosPersonales(datos: DatosInscripcion, integrante: IntegranteInscripcion) {
  const anchos = [457, 2657, 3886];
  const filaEncabezado = new TableRow({
    children: [celdaEncabezadoGrande('N°', anchos[0]), celdaEncabezadoGrande('Datos personales de cada participante', anchos[1] + anchos[2], 2)],
  });

  const campos: [string, string][] = [
    ['Nombre:', integrante.nombre || '—'],
    ['C.I.:', ciCompleto(integrante)],
    ['Números de referencia:', [datos.celular1, datos.celular2].filter(Boolean).join(' / ') || '—'],
    ['WhatsApp:', integrante.whatsapp || '—'],
    ['Dirección actual:', integrante.direccion || '—'],
    ['Instrumento(s) a ejecutar:', integrante.instrumento || '—'],
  ];

  const filas = campos.map(
    ([label, valor], index) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: anchos[0], type: WidthType.DXA },
            verticalMerge: index === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
            children: [
              index === 0
                ? new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '1', bold: true })] })
                : new Paragraph(''),
            ],
          }),
          new TableCell({
            width: { size: anchos[1], type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
          }),
          new TableCell({
            width: { size: anchos[2], type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(valor)] })],
          }),
        ],
      }),
  );

  return new Table({
    width: { size: anchos[0] + anchos[1] + anchos[2], type: WidthType.DXA },
    borders: bordes(4),
    rows: [filaEncabezado, ...filas],
  });
}

function construirAnexo2(
  datos: DatosInscripcion,
  integrante: IntegranteInscripcion,
  posicion: number,
  total: number,
): (Paragraph | Table)[] {
  const contenido: (Paragraph | Table)[] = [
    ...tituloAnexo(2, 'CARTA DE PRESENTACIÓN', 36, total > 1 ? `Integrante ${posicion} de ${total}` : undefined),
  ];

  contenido.push(parrafo(`Oruro, ${fechaLarga()}`, { align: AlignmentType.RIGHT, after: 240 }));
  contenido.push(parrafo('Señores:', { bold: true, after: 0 }));
  contenido.push(parrafo('Comité Organizador', { after: 0 }));
  contenido.push(parrafo(FESTIVAL, { after: 0 }));
  contenido.push(parrafo('Presente:', { bold: true, after: 200 }));
  contenido.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: 'Ref. PRESENTACIÓN DE POSTULACIÓN', bold: true, underline: { type: UnderlineType.SINGLE } })],
    }),
  );

  contenido.push(
    parrafo(
      `En primer lugar, reciban un cordial saludo. El motivo de la presente nota es para solicitar que mi postulación en la categoría ${datos.categoria} sea considerada para ser parte de la etapa final del ${FESTIVAL}, bajo las condiciones del comité organizador.`,
      { after: 240 },
    ),
  );

  contenido.push(tablaDatosPersonales(datos, integrante));
  contenido.push(new Paragraph({ spacing: { after: 200 } }));

  contenido.push(parrafo('Sin más que añadir a la presente nota me despido con las consideraciones del caso.', { after: 160 }));
  contenido.push(...bloqueFirma());

  return contenido;
}

function construirAnexo3(
  datos: DatosInscripcion,
  integrante: IntegranteInscripcion,
  posicion: number,
  total: number,
): (Paragraph | Table)[] {
  const contenido: (Paragraph | Table)[] = [
    ...tituloAnexo(3, 'DECLARACIÓN VOLUNTARIA', 36, total > 1 ? `Integrante ${posicion} de ${total}` : undefined),
  ];

  contenido.push(parrafo(`Oruro, ${fechaLarga()}`, { align: AlignmentType.RIGHT, after: 240 }));
  contenido.push(parrafo('Señores:', { bold: true, after: 0 }));
  contenido.push(parrafo('Comité Organizador', { after: 0 }));
  contenido.push(parrafo(FESTIVAL, { after: 0 }));
  contenido.push(parrafo('Presente:', { bold: true, after: 240 }));

  contenido.push(
    parrafo(`Yo, ${integrante.nombre || '—'}, con C.I. ${ciCompleto(integrante)}, postulante a la categoría ${datos.categoria}.`, {
      after: 200,
    }),
  );
  contenido.push(
    parrafo(
      `Declaro, de manera voluntaria, que no fui ni actualmente soy miembro de una agrupación musical profesional, por lo cual solicito que se considere mi postulación al ${FESTIVAL}.`,
      { after: 160 },
    ),
  );
  contenido.push(parrafo('*(Omitir este punto para la categoría: Especial)', { bold: true, italics: true, after: 240 }));
  contenido.push(
    parrafo(
      '*Al presentar en concurso una canción inédita, exento de toda responsabilidad y riesgo de denuncia de plagio y/o propiedad al comité organizador.',
      { after: 240 },
    ),
  );
  contenido.push(parrafo('Sin más que añadir a la presente nota me despido con las consideraciones distinguidas.', { after: 160 }));
  contenido.push(...bloqueFirma());

  return contenido;
}

function nombreArchivo(datos: DatosInscripcion) {
  const base = (datos.nombrePostulante || datos.categoria || 'inscripcion')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `Inscripcion_${base || 'AquiCantaBolivia'}_2026.docx`;
}

export async function generarInscripcionDocx(datos: DatosInscripcion) {
  const total = datos.integrantes.length;
  const contenido: (Paragraph | Table)[] = construirAnexo1(datos);

  datos.integrantes.forEach((integrante, index) => {
    contenido.push(new Paragraph({ children: [], pageBreakBefore: true }));
    contenido.push(...construirAnexo2(datos, integrante, index + 1, total));
  });

  if (datos.categoria !== 'Especial') {
    datos.integrantes.forEach((integrante, index) => {
      contenido.push(new Paragraph({ children: [], pageBreakBefore: true }));
      contenido.push(...construirAnexo3(datos, integrante, index + 1, total));
    });
  }

  const documento = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [{ properties: {}, children: contenido }],
  });

  const blob = await Packer.toBlob(documento);
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo(datos);
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

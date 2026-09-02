// Generador del mapa de zonas del Teatro Internacional de Oruro.
//
// Las 24 formas de zona y las 3 formas del escenario son las reales, trazadas
// a mano por el usuario sobre el plano oficial (no una aproximación
// matemática). Los ids/labels (A1..D10) son PROVISORIOS — todavía no sabemos
// qué número real de sector (66, 235, 333, etc.) corresponde a cada posición,
// así que por ahora son solo "fila+posición" de izquierda a derecha,
// empezando por la fila más cercana al escenario.
//
// Las butacas individuales (asientos dentro de cada zona) todavía no están
// cargadas — eso se hace en un paso posterior, una vez definido ese mapeo.

export type NivelPrecio = 'vip' | 'preferencial' | 'general';

export const PRECIOS: Record<NivelPrecio, number> = {
  vip: 150,
  preferencial: 100,
  general: 60,
};

export const NIVEL_LABEL: Record<NivelPrecio, string> = {
  vip: 'VIP',
  preferencial: 'Preferencial',
  general: 'General',
};

// Colores por nivel de precio — solo se usan en la leyenda y el carrito, no
// necesariamente coinciden con el color visual de la zona en el mapa (ver
// COLOR_FILA más abajo).
export const NIVEL_COLOR: Record<NivelPrecio, string> = {
  vip: '#d98a1e',
  preferencial: '#38bdf8',
  general: '#10b981',
};

// Colores originales con los que el usuario trazó cada fila en el plano
// (A=verde, B=amarillo, C=rojo, D=guinda). Son puramente para distinguir las
// zonas a simple vista en el mapa — no representan nivel de precio, así que
// van separados de NIVEL_COLOR. Usan la paleta de marca (no primarios puros)
// para que el mapa se sienta parte del mismo sitio y no "de neón".
export const COLOR_FILA: Record<string, string> = {
  A: '#2e7d46',
  B: '#d98a1e',
  C: '#d52b1e',
  D: '#8f1710',
};

export const COLOR_OCUPADO = '#b9b0a1';
export const COLOR_SELECCIONADO = '#e6483a';

export const VIEWBOX = { width: 1000, height: 700 };

// Contorno real del escenario, trazado a mano junto con las zonas (antes era
// un rectángulo genérico). Queda abajo del abanico de sectores, tal cual el
// plano original — no arriba.
export const ESCENARIO_PATHS = [
  'M 412.95 618.77 L 396.39 593.63 L 421.54 582.59 L 416.63 568.48 L 436.87 558.67 L 567.50 559.90 L 601.85 572.78 L 594.49 586.88 L 610.43 592.40 L 594.49 618.77 Z',
  'M 648.46 585.65 L 617.79 579.52 L 595.71 618.16 L 638.03 618.77 L 648.46 585.65 Z',
  'M 359.59 586.88 L 387.80 578.91 L 412.34 620.00 L 370.02 618.16 L 359.59 586.88 Z',
];
export const ESCENARIO_LABEL = { x: 504.03, y: 589.33 };

export interface Butaca {
  id: string;
  sectorId: string;
  sectorLabel: string;
  nivel: NivelPrecio;
  fila: number;
  numero: number;
  /** Letra visible de la fila (normalmente A, B, C... desde el escenario
   * hacia atrás, salvo casos especiales como "PA"). */
  letra: string;
  /** Código visible del asiento, ej. "A-20". */
  codigo: string;
  x: number;
  y: number;
  /** Rotación en grados (SVG rotate) para que la butaca quede orientada
   * hacia el escenario en vez de quedar siempre "derecha". */
  angulo: number;
  ocupada: boolean;
}

/** Convierte el número de fila (1 = más cerca del escenario) en su letra: 1→A, 2→B, etc. */
export function filaLetra(fila: number): string {
  return String.fromCharCode(64 + fila);
}

export interface Zona {
  id: string;
  label: string;
  nivel: NivelPrecio;
  /** Path SVG de la cuña completa del sector, trazado desde el plano real. */
  path: string;
  /** Centro aproximado del sector, para ubicar la etiqueta grande. */
  centro: { x: number; y: number };
  /** Caja que envuelve la zona, para encuadrar el zoom al hacer click. */
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

// Filas de adelante (pegadas al escenario, que ahora queda abajo) hacia
// atrás. Coordenadas ya transformadas al VIEWBOX de la app.
const ZONAS: Zona[] = [
  { id: 'A1', label: 'A1', nivel: 'vip', path: 'M 412.70 421.82 L 325.10 453.05 L 270.89 494.25 L 333.34 588.35 L 376.27 559.30 L 435.69 535.01 Z', centro: { x: 353.29, y: 505.09 }, bbox: { x0: 270.89, y0: 421.82, x1: 435.69, y1: 588.35 } },
  { id: 'A2', label: 'A2', nivel: 'vip', path: 'M 446.53 533.71 L 558.42 534.14 L 581.40 420.09 L 422.68 421.39 Z', centro: { x: 502.04, y: 477.12 }, bbox: { x0: 422.68, y0: 420.09, x1: 581.4, y1: 534.14 } },
  { id: 'A3', label: 'A3', nivel: 'vip', path: 'M 593.11 421.82 L 570.56 535.44 L 629.97 559.30 L 669.00 586.62 L 738.82 493.81 L 681.58 453.91 Z', centro: { x: 654.69, y: 504.22 }, bbox: { x0: 570.56, y0: 421.82, x1: 738.82, y1: 586.62 } },
  { id: 'B1', label: 'B1', nivel: 'preferencial', path: 'M 245.74 482.10 L 314.69 434.83 L 269.16 341.16 L 188.49 394.07 Z', centro: { x: 251.59, y: 411.63 }, bbox: { x0: 188.49, y0: 341.16, x1: 314.69, y1: 482.1 } },
  { id: 'B2', label: 'B2', nivel: 'preferencial', path: 'M 277.83 335.09 L 330.74 434.83 L 408.37 401.01 L 384.51 291.29 Z', centro: { x: 343.1, y: 363.06 }, bbox: { x0: 277.83, y0: 291.29, x1: 408.37, y1: 434.83 } },
  { id: 'B3', label: 'B3', nivel: 'preferencial', path: 'M 395.79 291.29 L 608.29 291.72 L 584.87 406.21 L 420.07 405.78 Z', centro: { x: 502.04, y: 348.75 }, bbox: { x0: 395.79, y0: 291.29, x1: 608.29, y1: 406.21 } },
  { id: 'B4', label: 'B4', nivel: 'preferencial', path: 'M 675.94 437.87 L 731.88 335.95 L 619.56 293.45 L 599.18 405.34 Z', centro: { x: 665.53, y: 365.66 }, bbox: { x0: 599.18, y0: 293.45, x1: 731.88, y1: 437.87 } },
  { id: 'B5', label: 'B5', nivel: 'preferencial', path: 'M 760.07 477.33 L 813.85 391.03 L 740.12 343.33 L 692.42 432.23 Z', centro: { x: 753.13, y: 410.33 }, bbox: { x0: 692.42, y0: 343.33, x1: 813.85, y1: 477.33 } },
  { id: 'C1', label: 'C1', nivel: 'preferencial', path: 'M 174.18 369.78 L 253.54 319.04 L 199.34 216.26 L 112.17 274.81 Z', centro: { x: 182.86, y: 293.02 }, bbox: { x0: 112.17, y0: 216.26, x1: 253.54, y1: 369.78 } },
  { id: 'C2', label: 'C2', nivel: 'preferencial', path: 'M 273.06 319.91 L 373.67 276.98 L 351.55 150.78 L 211.48 207.15 Z', centro: { x: 292.57, y: 235.34 }, bbox: { x0: 211.48, y0: 150.78, x1: 373.67, y1: 319.91 } },
  { id: 'C3', label: 'C3', nivel: 'preferencial', path: 'M 394.05 272.64 L 495.53 271.77 L 496.40 143.84 L 366.73 146.44 Z', centro: { x: 431.57, y: 208.24 }, bbox: { x0: 366.73, y0: 143.84, x1: 496.4, y1: 272.64 } },
  { id: 'C4', label: 'C4', nivel: 'preferencial', path: 'M 506.81 271.77 L 508.11 144.27 L 636.48 145.14 L 608.29 272.64 Z', centro: { x: 571.64, y: 208.46 }, bbox: { x0: 506.81, y0: 144.27, x1: 636.48, y1: 272.64 } },
  { id: 'C5', label: 'C5', nivel: 'preferencial', path: 'M 629.54 274.37 L 733.62 316.87 L 789.56 205.42 L 654.69 150.78 Z', centro: { x: 709.55, y: 233.83 }, bbox: { x0: 629.54, y0: 150.78, x1: 789.56, y1: 316.87 } },
  { id: 'C6', label: 'C6', nivel: 'preferencial', path: 'M 754.87 320.78 L 831.20 371.52 L 893.21 271.34 L 803.44 216.26 Z', centro: { x: 824.04, y: 293.89 }, bbox: { x0: 754.87, y0: 216.26, x1: 893.21, y1: 371.52 } },
  { id: 'D2', label: 'D2', nivel: 'general', path: 'M 109.06 119.54 L 153.21 164.01 L 172.23 205.10 L 132.98 228.10 L 109.67 181.49 L 82.38 137.64 Z', centro: { x: 127.3, y: 173.82 }, bbox: { x0: 82.38, y0: 119.54, x1: 172.23, y1: 228.1 } },
  { id: 'D1', label: 'D1', nivel: 'general', path: 'M 85.75 272.87 L 51.71 220.12 L 54.78 158.79 L 70.42 147.45 L 126.84 233.31 Z', centro: { x: 89.28, y: 210.16 }, bbox: { x0: 51.71, y0: 147.45, x1: 126.84, y1: 272.87 } },
  { id: 'D3', label: 'D3', nivel: 'general', path: 'M 228.65 65.88 L 264.22 163.39 L 211.17 185.17 L 192.47 146.83 L 172.23 88.57 Z', centro: { x: 218.22, y: 125.52 }, bbox: { x0: 172.23, y0: 65.88, x1: 264.22, y1: 185.17 } },
  { id: 'D4', label: 'D4', nivel: 'general', path: 'M 246.13 55.76 L 274.34 159.41 L 335.06 133.96 L 327.09 101.45 L 300.71 36.44 Z', centro: { x: 290.59, y: 97.92 }, bbox: { x0: 246.13, y0: 36.44, x1: 335.06, y1: 159.41 } },
  { id: 'D5', label: 'D5', nivel: 'general', path: 'M 429.51 30.00 L 440.24 78.14 L 440.55 123.22 L 380.44 124.14 L 378.91 31.23 Z', centro: { x: 409.73, y: 77.07 }, bbox: { x0: 378.91, y0: 30, x1: 440.55, y1: 124.14 } },
  { id: 'D6', label: 'D6', nivel: 'general', path: 'M 626.38 33.07 L 626.38 122.61 L 561.68 121.08 L 562.29 78.76 L 573.64 32.15 Z', centro: { x: 594.03, y: 77.38 }, bbox: { x0: 561.68, y0: 32.15, x1: 626.38, y1: 122.61 } },
  { id: 'D7', label: 'D7', nivel: 'general', path: 'M 747.51 52.39 L 744.75 115.56 L 727.58 156.95 L 667.47 130.89 L 689.24 88.88 L 694.46 51.16 L 703.96 37.05 Z', centro: { x: 707.49, y: 97 }, bbox: { x0: 667.47, y0: 37.05, x1: 747.51, y1: 156.95 } },
  { id: 'D8', label: 'D8', nivel: 'general', path: 'M 764.84 79.65 L 738.39 160.32 L 793.90 182.43 L 828.16 103.94 L 822.52 84.42 L 780.89 68.81 Z', centro: { x: 783.28, y: 125.62 }, bbox: { x0: 738.39, y0: 68.81, x1: 828.16, y1: 182.43 } },
  { id: 'D9', label: 'D9', nivel: 'general', path: 'M 831.20 203.68 L 866.32 224.50 L 919.23 138.63 L 888.87 118.25 L 854.18 155.98 Z', centro: { x: 875.21, y: 171.38 }, bbox: { x0: 831.2, y0: 118.25, x1: 919.23, y1: 224.5 } },
  { id: 'D10', label: 'D10', nivel: 'general', path: 'M 934.84 152.95 L 872.83 227.54 L 916.63 269.60 L 948.29 221.47 L 946.55 163.79 Z', centro: { x: 910.56, y: 211.27 }, bbox: { x0: 872.83, y0: 152.95, x1: 948.29, y1: 269.6 } },
];

interface MapaTeatro {
  butacas: Butaca[];
  zonas: Zona[];
}

type Punto = [number, number];

interface DefinicionFilaAsientos {
  /** Número del primer y último asiento de la fila (numeración real del teatro). */
  inicio: number;
  fin: number;
  /** Letra explícita (ej. "PA", o para continuar el alfabeto entre zonas
   * vecinas de la misma franja, ej. B1 termina en I y B2 sigue en K). Si no
   * se da, se usa filaLetra(posición dentro de esta zona). */
  letra?: string;
}

interface DefinicionZonaAsientos {
  sectorId: string;
  sectorLabel: string;
  nivel: NivelPrecio;
  /** Las 4 esquinas de la cuña, para interpolar filas entre el borde cercano
   * al escenario (bottom) y el borde lejano (top). */
  esquinas: { bottomLeft: Punto; bottomRight: Punto; topLeft: Punto; topRight: Punto };
  /** Filas de abajo (cerca del escenario) hacia arriba, cada una centrada
   * entre el borde izquierdo y derecho de la cuña en esa altura. */
  filas: DefinicionFilaAsientos[];
  /** Si es true, las butacas quedan derechas (sin rotar) en vez de ir
   * orientándose hacia el escenario según su posición en el ancho de la
   * fila — para bloques rectos donde las filas no están en abanico. */
  recto?: boolean;
}

function lerp(a: Punto, b: Punto, t: number): Punto {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function restar(a: Punto, b: Punto): Punto {
  return [a[0] - b[0], a[1] - b[1]];
}

// Ángulo (grados, para SVG rotate) que orienta una butaca hacia el
// escenario: v es el vector "de atrás hacia adelante" en su posición — el
// rect sin rotar ya mira hacia adelante (eje +Y), así que se rota lo que
// falta entre ese eje y v.
function anguloHaciaEscenario(v: Punto): number {
  return (Math.atan2(v[1], v[0]) * 180) / Math.PI - 90;
}

function crearButaca(
  sectorId: string,
  sectorLabel: string,
  nivel: NivelPrecio,
  filaNum: number,
  numero: number,
  [x, y]: Punto,
  angulo: number,
  letra: string = filaLetra(filaNum)
): Butaca {
  return {
    id: `${sectorId}-${filaNum}-${numero}`,
    sectorId,
    sectorLabel,
    nivel,
    fila: filaNum,
    numero,
    letra,
    codigo: `${letra}-${numero}`,
    x,
    y,
    angulo,
    ocupada: false,
  };
}

function generarButacasTrapecio(def: DefinicionZonaAsientos): Butaca[] {
  const { bottomLeft, bottomRight, topLeft, topRight } = def.esquinas;
  const n = def.filas.length;
  const butacas: Butaca[] = [];

  // Vector de atrás hacia adelante (hacia el escenario) en el borde
  // izquierdo y derecho de la cuña — se interpola entre ambos según la
  // posición de cada butaca en el ancho de la fila.
  const adelanteIzq = restar(bottomLeft, topLeft);
  const adelanteDer = restar(bottomRight, topRight);

  def.filas.forEach((fila, i) => {
    const t = (i + 0.5) / n;
    const left = lerp(bottomLeft, topLeft, t);
    const right = lerp(bottomRight, topRight, t);
    const cantidad = fila.fin - fila.inicio + 1;
    const filaNum = i + 1;

    for (let j = 0; j < cantidad; j++) {
      const s = (j + 0.5) / cantidad;
      const numero = fila.inicio + j;
      const angulo = def.recto ? 0 : anguloHaciaEscenario(lerp(adelanteIzq, adelanteDer, s));
      butacas.push(
        crearButaca(def.sectorId, def.sectorLabel, def.nivel, filaNum, numero, lerp(left, right, s), angulo, fila.letra)
      );
    }
  });

  return butacas;
}

// Para zonas con curvatura (el borde cercano y el lejano cada uno se dobla en
// dos tramos): cada fila se arma en 2 secciones — de "left" a "mid" y de
// "mid" a "right" — en vez de un solo tramo recto, para seguir la curva real
// de la zona. seccion1Inicio es opcional porque en algunas zonas (ej. A1) la
// numeración de cada fila arranca en 1; en otras (ej. A3) sigue la
// numeración real del teatro y hay que darla explícita.
interface DefinicionFilaCurva {
  seccion1Inicio?: number;
  seccion1Fin: number;
  seccion2Inicio: number;
  seccion2Fin: number;
}

interface DefinicionZonaCurva {
  sectorId: string;
  sectorLabel: string;
  nivel: NivelPrecio;
  esquinas: {
    frontLeft: Punto;
    frontMid: Punto;
    frontRight: Punto;
    backLeft: Punto;
    backMid: Punto;
    backRight: Punto;
  };
  /** Filas de adelante (cerca del escenario) hacia atrás. */
  filas: DefinicionFilaCurva[];
}

function generarButacasCurva(def: DefinicionZonaCurva): Butaca[] {
  const { frontLeft, frontMid, frontRight, backLeft, backMid, backRight } = def.esquinas;
  const n = def.filas.length;
  const butacas: Butaca[] = [];

  // Vector de atrás hacia adelante en el tramo izquierdo, el del quiebre y
  // el derecho — se interpola dentro de cada sección según la posición de
  // la butaca.
  const adelanteIzq = restar(frontLeft, backLeft);
  const adelanteMid = restar(frontMid, backMid);
  const adelanteDer = restar(frontRight, backRight);

  def.filas.forEach((fila, i) => {
    const t = (i + 0.5) / n;
    const left = lerp(frontLeft, backLeft, t);
    const mid = lerp(frontMid, backMid, t);
    const right = lerp(frontRight, backRight, t);
    const filaNum = i + 1;

    const seccion1Inicio = fila.seccion1Inicio ?? 1;
    const cantidad1 = fila.seccion1Fin - seccion1Inicio + 1;
    for (let j = 0; j < cantidad1; j++) {
      const s = (j + 0.5) / cantidad1;
      const numero = seccion1Inicio + j;
      const angulo = anguloHaciaEscenario(lerp(adelanteIzq, adelanteMid, s));
      butacas.push(crearButaca(def.sectorId, def.sectorLabel, def.nivel, filaNum, numero, lerp(left, mid, s), angulo));
    }

    const cantidad2 = fila.seccion2Fin - fila.seccion2Inicio + 1;
    for (let j = 0; j < cantidad2; j++) {
      const s = (j + 0.5) / cantidad2;
      const numero = fila.seccion2Inicio + j;
      const angulo = anguloHaciaEscenario(lerp(adelanteMid, adelanteDer, s));
      butacas.push(crearButaca(def.sectorId, def.sectorLabel, def.nivel, filaNum, numero, lerp(mid, right, s), angulo));
    }
  });

  return butacas;
}

// Para zonas donde el quiebre no está en el borde cercano/lejano sino en uno
// de los lados (ej. la punta de una cuña en el extremo del abanico, como
// D1 o D5): el lado con quiebre se arma en 2 tramos según la altura (y)
// real del vértice de quiebre; el otro lado es un tramo recto normal.
// Exactamente uno de quiebreIzquierdo/quiebreDerecho debe estar presente.
interface DefinicionZonaLadoCurvo {
  sectorId: string;
  sectorLabel: string;
  nivel: NivelPrecio;
  esquinas: {
    frontLeft: Punto;
    backLeft: Punto;
    frontRight: Punto;
    backRight: Punto;
    /** Vértice extra en el lado izquierdo, entre front y back. */
    quiebreIzquierdo?: Punto;
    /** Vértice extra en el lado derecho, entre front y back. */
    quiebreDerecho?: Punto;
  };
  filas: DefinicionFilaAsientos[];
}

function ladoConQuiebre(
  front: Punto,
  back: Punto,
  quiebre: Punto,
  t: number
): { punto: Punto; adelante: Punto } {
  const quiebreT = (front[1] - quiebre[1]) / (front[1] - back[1]);
  if (t <= quiebreT) {
    return { punto: lerp(front, quiebre, t / quiebreT), adelante: restar(front, quiebre) };
  }
  return { punto: lerp(quiebre, back, (t - quiebreT) / (1 - quiebreT)), adelante: restar(quiebre, back) };
}

function generarButacasLadoCurvo(def: DefinicionZonaLadoCurvo): Butaca[] {
  const { frontLeft, backLeft, frontRight, backRight, quiebreIzquierdo, quiebreDerecho } = def.esquinas;
  const n = def.filas.length;
  const butacas: Butaca[] = [];

  def.filas.forEach((fila, i) => {
    const t = (i + 0.5) / n;

    const ladoIzq = quiebreIzquierdo
      ? ladoConQuiebre(frontLeft, backLeft, quiebreIzquierdo, t)
      : { punto: lerp(frontLeft, backLeft, t), adelante: restar(frontLeft, backLeft) };
    const ladoDer = quiebreDerecho
      ? ladoConQuiebre(frontRight, backRight, quiebreDerecho, t)
      : { punto: lerp(frontRight, backRight, t), adelante: restar(frontRight, backRight) };

    const cantidad = fila.fin - fila.inicio + 1;
    const filaNum = i + 1;

    for (let j = 0; j < cantidad; j++) {
      const s = (j + 0.5) / cantidad;
      const numero = fila.inicio + j;
      const angulo = anguloHaciaEscenario(lerp(ladoIzq.adelante, ladoDer.adelante, s));
      butacas.push(
        crearButaca(
          def.sectorId,
          def.sectorLabel,
          def.nivel,
          filaNum,
          numero,
          lerp(ladoIzq.punto, ladoDer.punto, s),
          angulo,
          fila.letra
        )
      );
    }
  });

  return butacas;
}

// Asientos dictados por el usuario, fila por fila de adelante (cerca del
// escenario) hacia atrás, con el primer y último número de asiento de cada
// fila (todos centrados en el ancho de la cuña a esa altura).
const BUTACAS_A2 = generarButacasTrapecio({
  sectorId: 'A2',
  sectorLabel: 'A2',
  nivel: 'vip',
  esquinas: {
    bottomLeft: [446.53, 533.71],
    bottomRight: [558.42, 534.14],
    topLeft: [422.68, 421.39],
    topRight: [581.4, 420.09],
  },
  filas: [
    { inicio: 20, fin: 39 },
    { inicio: 21, fin: 41 },
    { inicio: 22, fin: 43 },
    { inicio: 23, fin: 44 },
    { inicio: 23, fin: 45 },
    { inicio: 24, fin: 47 },
    { inicio: 24, fin: 48 },
    { inicio: 26, fin: 50 },
    { inicio: 26, fin: 51 },
    { inicio: 27, fin: 53 },
  ],
});

// A1 tiene curvatura tanto en el borde cercano al escenario como en el
// lejano (cada uno se dobla en 2 tramos) — el usuario la dictó de atrás
// (lejos del escenario) hacia adelante, así que acá el orden queda invertido
// para que la fila 1 siga siendo la más cercana al escenario (letra A).
const BUTACAS_A1 = generarButacasCurva({
  sectorId: 'A1',
  sectorLabel: 'A1',
  nivel: 'vip',
  esquinas: {
    frontLeft: [333.34, 588.35],
    frontMid: [376.27, 559.3],
    frontRight: [435.69, 535.01],
    backLeft: [270.89, 494.25],
    backMid: [325.1, 453.05],
    backRight: [412.7, 421.82],
  },
  filas: [
    { seccion1Fin: 8, seccion2Inicio: 9, seccion2Fin: 19 },
    { seccion1Fin: 8, seccion2Inicio: 9, seccion2Fin: 20 },
    { seccion1Fin: 9, seccion2Inicio: 10, seccion2Fin: 21 },
    { seccion1Fin: 9, seccion2Inicio: 10, seccion2Fin: 22 },
    { seccion1Fin: 9, seccion2Inicio: 10, seccion2Fin: 22 },
    { seccion1Fin: 9, seccion2Inicio: 10, seccion2Fin: 23 },
    { seccion1Fin: 9, seccion2Inicio: 10, seccion2Fin: 23 },
    { seccion1Fin: 10, seccion2Inicio: 11, seccion2Fin: 25 },
    { seccion1Fin: 10, seccion2Inicio: 11, seccion2Fin: 25 },
    { seccion1Fin: 10, seccion2Inicio: 11, seccion2Fin: 26 },
  ],
});

// A3 es el espejo de A1 (curvatura del otro lado del abanico), pero acá la
// numeración de cada fila ya sigue la numeración real del teatro (no
// arranca en 1), así que las 2 secciones llevan inicio y fin explícitos.
// Mismo criterio de orden: dictado de atrás hacia adelante, invertido para
// que la fila 1 sea la más cercana al escenario.
const BUTACAS_A3 = generarButacasCurva({
  sectorId: 'A3',
  sectorLabel: 'A3',
  nivel: 'vip',
  esquinas: {
    frontLeft: [570.56, 535.44],
    frontMid: [629.97, 559.3],
    frontRight: [669.0, 586.62],
    backLeft: [593.11, 421.82],
    backMid: [681.58, 453.91],
    backRight: [738.82, 493.81],
  },
  filas: [
    { seccion1Inicio: 40, seccion1Fin: 50, seccion2Inicio: 51, seccion2Fin: 58 },
    { seccion1Inicio: 42, seccion1Fin: 52, seccion2Inicio: 53, seccion2Fin: 60 },
    { seccion1Inicio: 44, seccion1Fin: 55, seccion2Inicio: 56, seccion2Fin: 63 },
    { seccion1Inicio: 45, seccion1Fin: 57, seccion2Inicio: 58, seccion2Fin: 66 },
    { seccion1Inicio: 46, seccion1Fin: 58, seccion2Inicio: 59, seccion2Fin: 67 },
    { seccion1Inicio: 48, seccion1Fin: 61, seccion2Inicio: 62, seccion2Fin: 70 },
    { seccion1Inicio: 49, seccion1Fin: 62, seccion2Inicio: 63, seccion2Fin: 71 },
    { seccion1Inicio: 51, seccion1Fin: 65, seccion2Inicio: 66, seccion2Fin: 74 },
    { seccion1Inicio: 52, seccion1Fin: 67, seccion2Inicio: 68, seccion2Fin: 76 },
    { seccion1Inicio: 54, seccion1Fin: 69, seccion2Inicio: 70, seccion2Fin: 79 },
  ],
});

// B1 es una cuña recta (sin curvatura). El usuario solo dictó el número
// final de cada fila (siempre arranca en 1), en el mismo orden de atrás
// hacia adelante que las zonas A — así que se invierte para que la fila 1
// sea la más cercana al escenario. Son 9 filas, letras K..S (comparte el
// mismo set que B2, cada una con su propia numeración de 1 a N).
const BUTACAS_B1 = generarButacasTrapecio({
  sectorId: 'B1',
  sectorLabel: 'B1',
  nivel: 'preferencial',
  esquinas: {
    bottomLeft: [245.74, 482.1],
    bottomRight: [314.69, 434.83],
    topLeft: [188.49, 394.07],
    topRight: [269.16, 341.16],
  },
  filas: [
    { inicio: 1, fin: 14, letra: 'K' },
    { inicio: 1, fin: 14, letra: 'L' },
    { inicio: 1, fin: 14, letra: 'M' },
    { inicio: 1, fin: 14, letra: 'N' },
    { inicio: 1, fin: 15, letra: 'O' },
    { inicio: 1, fin: 15, letra: 'P' },
    { inicio: 1, fin: 15, letra: 'Q' },
    { inicio: 1, fin: 15, letra: 'R' },
    { inicio: 1, fin: 16, letra: 'S' },
  ],
});

// B2 reutiliza las mismas letras que B1 (K..S). La fila más cercana al
// escenario queda marcada como "PA" (fila especial, la única que arranca en
// 1); las siguientes (K..S) no reinician la numeración — continúa.
const BUTACAS_B2 = generarButacasTrapecio({
  sectorId: 'B2',
  sectorLabel: 'B2',
  nivel: 'preferencial',
  esquinas: {
    bottomLeft: [330.74, 434.83],
    bottomRight: [408.37, 401.01],
    topLeft: [277.83, 335.09],
    topRight: [384.51, 291.29],
  },
  filas: [
    { inicio: 1, fin: 14, letra: 'PA' },
    { inicio: 15, fin: 30, letra: 'K' },
    { inicio: 15, fin: 30, letra: 'L' },
    { inicio: 15, fin: 31, letra: 'M' },
    { inicio: 15, fin: 31, letra: 'N' },
    { inicio: 16, fin: 33, letra: 'O' },
    { inicio: 16, fin: 33, letra: 'P' },
    { inicio: 16, fin: 33, letra: 'Q' },
    { inicio: 16, fin: 34, letra: 'R' },
    { inicio: 17, fin: 35, letra: 'S' },
  ],
});

// B3 reutiliza el mismo set de letras que B2 (PA, K..S) en vez de continuar
// el alfabeto — cada zona de esta franja repite PA..S. La numeración sí
// continúa: el inicio de cada fila es el fin de la fila equivalente de B2 + 1.
const BUTACAS_B3 = generarButacasTrapecio({
  sectorId: 'B3',
  sectorLabel: 'B3',
  nivel: 'preferencial',
  recto: true,
  esquinas: {
    bottomLeft: [420.07, 405.78],
    bottomRight: [584.87, 406.21],
    topLeft: [395.79, 291.29],
    topRight: [608.29, 291.72],
  },
  filas: [
    { inicio: 15, fin: 49, letra: 'PA' },
    { inicio: 31, fin: 61, letra: 'K' },
    { inicio: 31, fin: 61, letra: 'L' },
    { inicio: 32, fin: 63, letra: 'M' },
    { inicio: 32, fin: 64, letra: 'N' },
    { inicio: 34, fin: 67, letra: 'O' },
    { inicio: 34, fin: 67, letra: 'P' },
    { inicio: 34, fin: 68, letra: 'Q' },
    { inicio: 35, fin: 70, letra: 'R' },
    { inicio: 36, fin: 72, letra: 'S' },
  ],
});

// B4 sigue el mismo criterio que B3: mismas letras (PA, K..S) y la
// numeración continúa desde el fin de la fila equivalente de B3, +1.
const BUTACAS_B4 = generarButacasTrapecio({
  sectorId: 'B4',
  sectorLabel: 'B4',
  nivel: 'preferencial',
  esquinas: {
    bottomLeft: [599.18, 405.34],
    bottomRight: [675.94, 437.87],
    topLeft: [619.56, 293.45],
    topRight: [731.88, 335.95],
  },
  filas: [
    { inicio: 50, fin: 58, letra: 'PA' },
    { inicio: 62, fin: 76, letra: 'K' },
    { inicio: 62, fin: 77, letra: 'L' },
    { inicio: 64, fin: 80, letra: 'M' },
    { inicio: 65, fin: 80, letra: 'N' },
    { inicio: 68, fin: 84, letra: 'O' },
    { inicio: 68, fin: 85, letra: 'P' },
    { inicio: 69, fin: 86, letra: 'Q' },
    { inicio: 71, fin: 89, letra: 'R' },
    { inicio: 73, fin: 91, letra: 'S' },
  ],
});

// B5 es el extremo de la franja (como B1), así que no tiene fila PA — son
// 9 filas K..S (mismas letras que las filas regulares de B2-B4), con la
// numeración continuando desde el fin de la fila equivalente de B4, +1.
const BUTACAS_B5 = generarButacasTrapecio({
  sectorId: 'B5',
  sectorLabel: 'B5',
  nivel: 'preferencial',
  esquinas: {
    bottomLeft: [692.42, 432.23],
    bottomRight: [760.07, 477.33],
    topLeft: [740.12, 343.33],
    topRight: [813.85, 391.03],
  },
  filas: [
    { inicio: 77, fin: 90, letra: 'K' },
    { inicio: 78, fin: 91, letra: 'L' },
    { inicio: 81, fin: 94, letra: 'M' },
    { inicio: 81, fin: 94, letra: 'N' },
    { inicio: 85, fin: 98, letra: 'O' },
    { inicio: 86, fin: 99, letra: 'P' },
    { inicio: 87, fin: 100, letra: 'Q' },
    { inicio: 90, fin: 103, letra: 'R' },
    { inicio: 92, fin: 106, letra: 'S' },
  ],
});

// C1 es el extremo de la franja C (como B1 lo es de la B): letras nuevas
// que continúan el alfabeto global (T en vez de reiniciar en A), pero cada
// fila numera sus propias butacas desde 1 — es una franja físicamente
// distinta de la B, no una continuación de su numeración.
const BUTACAS_C1 = generarButacasTrapecio({
  sectorId: 'C1',
  sectorLabel: 'C1',
  nivel: 'preferencial',
  esquinas: {
    bottomLeft: [174.18, 369.78],
    bottomRight: [253.54, 319.04],
    topLeft: [112.17, 274.81],
    topRight: [199.34, 216.26],
  },
  filas: [
    { inicio: 1, fin: 16, letra: 'T' },
    { inicio: 1, fin: 15, letra: 'U' },
    { inicio: 1, fin: 16, letra: 'V' },
    { inicio: 1, fin: 16, letra: 'W' },
    { inicio: 1, fin: 16, letra: 'X' },
    { inicio: 1, fin: 16, letra: 'Y' },
    { inicio: 1, fin: 16, letra: 'Z' },
    { inicio: 1, fin: 17, letra: 'AA' },
    { inicio: 1, fin: 17, letra: 'BB' },
    { inicio: 1, fin: 17, letra: 'CC' },
  ],
});

// C2 reutiliza las letras de C1 (T..CC) y suma una fila especial "PB" (como
// PA en la franja B) al frente. La numeración de las filas T..CC continúa
// desde el fin de la fila equivalente en C1, +1; PB arranca en 1.
const BUTACAS_C2 = generarButacasTrapecio({
  sectorId: 'C2',
  sectorLabel: 'C2',
  nivel: 'preferencial',
  esquinas: {
    bottomLeft: [273.06, 319.91],
    bottomRight: [373.67, 276.98],
    topLeft: [211.48, 207.15],
    topRight: [351.55, 150.78],
  },
  filas: [
    { inicio: 1, fin: 19, letra: 'PB' },
    { inicio: 17, fin: 36, letra: 'T' },
    { inicio: 16, fin: 35, letra: 'U' },
    { inicio: 17, fin: 37, letra: 'V' },
    { inicio: 17, fin: 37, letra: 'W' },
    { inicio: 17, fin: 38, letra: 'X' },
    { inicio: 17, fin: 39, letra: 'Y' },
    { inicio: 17, fin: 39, letra: 'Z' },
    { inicio: 18, fin: 40, letra: 'AA' },
    { inicio: 18, fin: 41, letra: 'BB' },
    { inicio: 18, fin: 42, letra: 'CC' },
  ],
});

// C3 reutiliza las letras de C1/C2 (T..CC) y suma su propia fila "PB" al
// frente (cada zona tiene su propia PB, como B2/B3/B4 tenían cada una su
// propia "PA"). Tanto T..CC como PB continúan fila por fila desde C2 (PB
// de C2 terminó en 19, así que la PB de C3 arranca en 20).
const BUTACAS_C3 = generarButacasTrapecio({
  sectorId: 'C3',
  sectorLabel: 'C3',
  nivel: 'preferencial',
  esquinas: {
    bottomLeft: [394.05, 272.64],
    bottomRight: [495.53, 271.77],
    topLeft: [366.73, 146.44],
    topRight: [496.4, 143.84],
  },
  filas: [
    { inicio: 20, fin: 37, letra: 'PB' },
    { inicio: 37, fin: 54, letra: 'T' },
    { inicio: 36, fin: 53, letra: 'U' },
    { inicio: 38, fin: 56, letra: 'V' },
    { inicio: 38, fin: 56, letra: 'W' },
    { inicio: 39, fin: 57, letra: 'X' },
    { inicio: 40, fin: 60, letra: 'Y' },
    { inicio: 40, fin: 60, letra: 'Z' },
    { inicio: 41, fin: 61, letra: 'AA' },
    { inicio: 42, fin: 63, letra: 'BB' },
    { inicio: 43, fin: 64, letra: 'CC' },
  ],
});

// C4 sigue el mismo criterio que C3: reutiliza T..CC y suma su propia PB —
// ambas siguen continuando la numeración desde C3 (PB de C3 terminó en 37).
// Van derechas (sin rotar), centradas hacia el escenario.
const BUTACAS_C4 = generarButacasTrapecio({
  sectorId: 'C4',
  sectorLabel: 'C4',
  nivel: 'preferencial',
  recto: true,
  esquinas: {
    bottomLeft: [506.81, 271.77],
    bottomRight: [608.29, 272.64],
    topLeft: [508.11, 144.27],
    topRight: [636.48, 145.14],
  },
  filas: [
    { inicio: 38, fin: 54, letra: 'PB' },
    { inicio: 55, fin: 72, letra: 'T' },
    { inicio: 54, fin: 71, letra: 'U' },
    { inicio: 57, fin: 75, letra: 'V' },
    { inicio: 57, fin: 75, letra: 'W' },
    { inicio: 58, fin: 76, letra: 'X' },
    { inicio: 61, fin: 81, letra: 'Y' },
    { inicio: 61, fin: 81, letra: 'Z' },
    { inicio: 62, fin: 82, letra: 'AA' },
    { inicio: 64, fin: 85, letra: 'BB' },
    { inicio: 65, fin: 86, letra: 'CC' },
  ],
});

// C5 sigue el mismo criterio: reutiliza T..CC y suma su propia PB — ambas
// continúan la numeración desde C4 (PB de C4 terminó en 54).
const BUTACAS_C5 = generarButacasTrapecio({
  sectorId: 'C5',
  sectorLabel: 'C5',
  nivel: 'preferencial',
  esquinas: {
    bottomLeft: [629.54, 274.37],
    bottomRight: [733.62, 316.87],
    topLeft: [654.69, 150.78],
    topRight: [789.56, 205.42],
  },
  filas: [
    { inicio: 55, fin: 73, letra: 'PB' },
    { inicio: 73, fin: 92, letra: 'T' },
    { inicio: 72, fin: 91, letra: 'U' },
    { inicio: 76, fin: 96, letra: 'V' },
    { inicio: 76, fin: 96, letra: 'W' },
    { inicio: 77, fin: 97, letra: 'X' },
    { inicio: 82, fin: 103, letra: 'Y' },
    { inicio: 82, fin: 103, letra: 'Z' },
    { inicio: 83, fin: 105, letra: 'AA' },
    { inicio: 86, fin: 109, letra: 'BB' },
    { inicio: 87, fin: 110, letra: 'CC' },
  ],
});

// C6 es el extremo de la franja (como C1), sin fila PB — son las 10 filas
// T..CC completas (mismas letras que las regulares de C3-C5) y la
// numeración continúa desde C5.
const BUTACAS_C6 = generarButacasTrapecio({
  sectorId: 'C6',
  sectorLabel: 'C6',
  nivel: 'preferencial',
  esquinas: {
    bottomLeft: [754.87, 320.78],
    bottomRight: [831.2, 371.52],
    topLeft: [803.44, 216.26],
    topRight: [893.21, 271.34],
  },
  filas: [
    { inicio: 93, fin: 107, letra: 'T' },
    { inicio: 92, fin: 106, letra: 'U' },
    { inicio: 97, fin: 112, letra: 'V' },
    { inicio: 97, fin: 112, letra: 'W' },
    { inicio: 98, fin: 113, letra: 'X' },
    { inicio: 104, fin: 119, letra: 'Y' },
    { inicio: 104, fin: 119, letra: 'Z' },
    { inicio: 106, fin: 122, letra: 'AA' },
    { inicio: 110, fin: 126, letra: 'BB' },
    { inicio: 111, fin: 127, letra: 'CC' },
  ],
});

// D1 es la primera zona de la franja D: arranca un set de letras nuevo
// (DD..LL, 9 filas) que continúa globalmente donde terminó el set de C
// (T..CC) — cada fila numera desde 1. La forma real tiene un quiebre en el
// lado izquierdo (el pentágono trazado, no un simple trapecio), así que usa
// el generador de lado curvo para seguir esa punta.
const BUTACAS_D1 = generarButacasLadoCurvo({
  sectorId: 'D1',
  sectorLabel: 'D1',
  nivel: 'general',
  esquinas: {
    frontLeft: [85.75, 272.87],
    frontRight: [126.84, 233.31],
    backRight: [70.42, 147.45],
    backLeft: [54.78, 158.79],
    quiebreIzquierdo: [51.71, 220.12],
  },
  filas: [
    { inicio: 1, fin: 9, letra: 'DD' },
    { inicio: 1, fin: 9, letra: 'EE' },
    { inicio: 1, fin: 9, letra: 'FF' },
    { inicio: 1, fin: 9, letra: 'GG' },
    { inicio: 1, fin: 9, letra: 'HH' },
    { inicio: 1, fin: 8, letra: 'II' },
    { inicio: 1, fin: 6, letra: 'JJ' },
    { inicio: 1, fin: 5, letra: 'KK' },
    { inicio: 1, fin: 2, letra: 'LL' },
  ],
});

// D2 reutiliza las letras de D1 (DD..LL) y continúa su numeración fila por
// fila.
const BUTACAS_D2 = generarButacasTrapecio({
  sectorId: 'D2',
  sectorLabel: 'D2',
  nivel: 'general',
  esquinas: {
    bottomLeft: [132.98, 228.1],
    bottomRight: [172.23, 205.1],
    topLeft: [82.38, 137.64],
    topRight: [109.06, 119.54],
  },
  filas: [
    { inicio: 10, fin: 16, letra: 'DD' },
    { inicio: 10, fin: 16, letra: 'EE' },
    { inicio: 10, fin: 16, letra: 'FF' },
    { inicio: 10, fin: 16, letra: 'GG' },
    { inicio: 10, fin: 15, letra: 'HH' },
    { inicio: 9, fin: 14, letra: 'II' },
    { inicio: 7, fin: 12, letra: 'JJ' },
    { inicio: 6, fin: 10, letra: 'KK' },
    { inicio: 3, fin: 7, letra: 'LL' },
  ],
});

// D3 reutiliza las mismas letras y continúa desde D2.
const BUTACAS_D3 = generarButacasTrapecio({
  sectorId: 'D3',
  sectorLabel: 'D3',
  nivel: 'general',
  esquinas: {
    bottomLeft: [211.17, 185.17],
    bottomRight: [264.22, 163.39],
    topLeft: [172.23, 88.57],
    topRight: [228.65, 65.88],
  },
  filas: [
    { inicio: 17, fin: 25, letra: 'DD' },
    { inicio: 17, fin: 26, letra: 'EE' },
    { inicio: 17, fin: 26, letra: 'FF' },
    { inicio: 17, fin: 26, letra: 'GG' },
    { inicio: 16, fin: 25, letra: 'HH' },
    { inicio: 15, fin: 24, letra: 'II' },
    { inicio: 13, fin: 22, letra: 'JJ' },
    { inicio: 11, fin: 20, letra: 'KK' },
    { inicio: 8, fin: 17, letra: 'LL' },
  ],
});

// D4 reutiliza las mismas letras y continúa desde D3.
const BUTACAS_D4 = generarButacasTrapecio({
  sectorId: 'D4',
  sectorLabel: 'D4',
  nivel: 'general',
  esquinas: {
    bottomLeft: [274.34, 159.41],
    bottomRight: [335.06, 133.96],
    topLeft: [246.13, 55.76],
    topRight: [300.71, 36.44],
  },
  filas: [
    { inicio: 26, fin: 36, letra: 'DD' },
    { inicio: 27, fin: 37, letra: 'EE' },
    { inicio: 27, fin: 37, letra: 'FF' },
    { inicio: 27, fin: 36, letra: 'GG' },
    { inicio: 26, fin: 35, letra: 'HH' },
    { inicio: 25, fin: 34, letra: 'II' },
    { inicio: 23, fin: 32, letra: 'JJ' },
    { inicio: 21, fin: 30, letra: 'KK' },
    { inicio: 18, fin: 26, letra: 'LL' },
  ],
});

// D5 reutiliza las letras DD..KK (le falta la fila más lejana, LL, que esta
// zona no tiene) y continúa la numeración desde D4 por letra. Su forma real
// tiene el quiebre en el lado derecho (al revés que D1).
const BUTACAS_D5 = generarButacasLadoCurvo({
  sectorId: 'D5',
  sectorLabel: 'D5',
  nivel: 'general',
  esquinas: {
    frontLeft: [380.44, 124.14],
    frontRight: [440.55, 123.22],
    backLeft: [378.91, 31.23],
    backRight: [429.51, 30.0],
    quiebreDerecho: [440.24, 78.14],
  },
  filas: [
    { inicio: 37, fin: 46, letra: 'DD' },
    { inicio: 38, fin: 47, letra: 'EE' },
    { inicio: 38, fin: 47, letra: 'FF' },
    { inicio: 37, fin: 46, letra: 'GG' },
    { inicio: 36, fin: 44, letra: 'HH' },
    { inicio: 35, fin: 43, letra: 'II' },
    { inicio: 33, fin: 40, letra: 'JJ' },
    { inicio: 31, fin: 38, letra: 'KK' },
  ],
});

// D6 arranca una segunda cadena dentro de la franja D (los números vuelven
// a ser chicos, como en D1) — reutiliza las letras DD..KK y cada fila
// numera desde 1. Su forma real tiene el quiebre en el lado izquierdo.
const BUTACAS_D6 = generarButacasLadoCurvo({
  sectorId: 'D6',
  sectorLabel: 'D6',
  nivel: 'general',
  esquinas: {
    frontLeft: [561.68, 121.08],
    frontRight: [626.38, 122.61],
    backLeft: [573.64, 32.15],
    backRight: [626.38, 33.07],
    quiebreIzquierdo: [562.29, 78.76],
  },
  filas: [
    { inicio: 1, fin: 10, letra: 'DD' },
    { inicio: 1, fin: 10, letra: 'EE' },
    { inicio: 1, fin: 10, letra: 'FF' },
    { inicio: 1, fin: 10, letra: 'GG' },
    { inicio: 1, fin: 9, letra: 'HH' },
    { inicio: 1, fin: 9, letra: 'II' },
    { inicio: 1, fin: 9, letra: 'JJ' },
    { inicio: 1, fin: 8, letra: 'KK' },
  ],
});

// D7 reutiliza las letras DD..LL (acá sí tiene la fila LL completa) y
// continúa la numeración desde D6. El plano real muestra esta zona como una
// cuña pareja (filas en abanico regular), así que se usan sus 4 esquinas
// principales en vez de los quiebres menores del trazado.
const BUTACAS_D7 = generarButacasTrapecio({
  sectorId: 'D7',
  sectorLabel: 'D7',
  nivel: 'general',
  esquinas: {
    bottomLeft: [667.47, 130.89],
    bottomRight: [727.58, 156.95],
    topLeft: [694.46, 51.16],
    topRight: [747.51, 52.39],
  },
  filas: [
    { inicio: 11, fin: 20, letra: 'DD' },
    { inicio: 11, fin: 20, letra: 'EE' },
    { inicio: 11, fin: 20, letra: 'FF' },
    { inicio: 11, fin: 20, letra: 'GG' },
    { inicio: 10, fin: 18, letra: 'HH' },
    { inicio: 10, fin: 18, letra: 'II' },
    { inicio: 10, fin: 18, letra: 'JJ' },
    { inicio: 9, fin: 16, letra: 'KK' },
    { inicio: 1, fin: 7, letra: 'LL' },
  ],
});

// D8 reutiliza las mismas letras y continúa desde D7. Su forma real se
// abulta hacia afuera en el lado derecho (2 vértices, aproximados como uno
// solo a mitad de camino entre ambos) — sin esto el bloque de butacas deja
// un hueco vacío contra el borde real de la zona.
const BUTACAS_D8 = generarButacasLadoCurvo({
  sectorId: 'D8',
  sectorLabel: 'D8',
  nivel: 'general',
  esquinas: {
    frontLeft: [738.39, 160.32],
    frontRight: [793.9, 182.43],
    backLeft: [764.84, 79.65],
    backRight: [780.89, 68.81],
    quiebreDerecho: [825.34, 94.18],
  },
  filas: [
    { inicio: 21, fin: 29, letra: 'DD' },
    { inicio: 21, fin: 30, letra: 'EE' },
    { inicio: 21, fin: 30, letra: 'FF' },
    { inicio: 21, fin: 30, letra: 'GG' },
    { inicio: 19, fin: 28, letra: 'HH' },
    { inicio: 19, fin: 28, letra: 'II' },
    { inicio: 19, fin: 28, letra: 'JJ' },
    { inicio: 17, fin: 26, letra: 'KK' },
    { inicio: 8, fin: 14, letra: 'LL' },
  ],
});

// D9 reutiliza las mismas letras y continúa desde D8. Su forma real tiene
// el quiebre en el lado izquierdo.
const BUTACAS_D9 = generarButacasLadoCurvo({
  sectorId: 'D9',
  sectorLabel: 'D9',
  nivel: 'general',
  esquinas: {
    frontLeft: [831.2, 203.68],
    frontRight: [866.32, 224.5],
    backLeft: [888.87, 118.25],
    backRight: [919.23, 138.63],
    quiebreIzquierdo: [854.18, 155.98],
  },
  filas: [
    { inicio: 30, fin: 36, letra: 'DD' },
    { inicio: 31, fin: 37, letra: 'EE' },
    { inicio: 31, fin: 37, letra: 'FF' },
    { inicio: 31, fin: 37, letra: 'GG' },
    { inicio: 29, fin: 35, letra: 'HH' },
    { inicio: 29, fin: 34, letra: 'II' },
    { inicio: 29, fin: 34, letra: 'JJ' },
    { inicio: 27, fin: 31, letra: 'KK' },
    { inicio: 15, fin: 18, letra: 'LL' },
  ],
});

// D10 reutiliza las mismas letras y continúa desde D9. Su forma real tiene
// el quiebre en el lado derecho.
const BUTACAS_D10 = generarButacasLadoCurvo({
  sectorId: 'D10',
  sectorLabel: 'D10',
  nivel: 'general',
  esquinas: {
    frontLeft: [872.83, 227.54],
    frontRight: [916.63, 269.6],
    backLeft: [934.84, 152.95],
    backRight: [946.55, 163.79],
    quiebreDerecho: [948.29, 221.47],
  },
  filas: [
    { inicio: 37, fin: 45, letra: 'DD' },
    { inicio: 38, fin: 46, letra: 'EE' },
    { inicio: 38, fin: 46, letra: 'FF' },
    { inicio: 38, fin: 46, letra: 'GG' },
    { inicio: 36, fin: 44, letra: 'HH' },
    { inicio: 35, fin: 41, letra: 'II' },
    { inicio: 35, fin: 39, letra: 'JJ' },
    { inicio: 32, fin: 34, letra: 'KK' },
    { inicio: 19, fin: 20, letra: 'LL' },
  ],
});

export function generarMapaTeatro(): MapaTeatro {
  // Las butacas se van cargando zona por zona a medida que se define la
  // numeración real; las zonas sin butacas todavía muestran el aviso
  // "próximamente" (ver TeatroSeatMap).
  return {
    butacas: [
      ...BUTACAS_A1,
      ...BUTACAS_A2,
      ...BUTACAS_A3,
      ...BUTACAS_B1,
      ...BUTACAS_B2,
      ...BUTACAS_B3,
      ...BUTACAS_B4,
      ...BUTACAS_B5,
      ...BUTACAS_C1,
      ...BUTACAS_C2,
      ...BUTACAS_C3,
      ...BUTACAS_C4,
      ...BUTACAS_C5,
      ...BUTACAS_C6,
      ...BUTACAS_D1,
      ...BUTACAS_D2,
      ...BUTACAS_D3,
      ...BUTACAS_D4,
      ...BUTACAS_D5,
      ...BUTACAS_D6,
      ...BUTACAS_D7,
      ...BUTACAS_D8,
      ...BUTACAS_D9,
      ...BUTACAS_D10,
    ],
    zonas: ZONAS,
  };
}

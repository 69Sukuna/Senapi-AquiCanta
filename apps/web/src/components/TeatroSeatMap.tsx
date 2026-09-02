'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ZoomIn, ZoomOut } from 'lucide-react';
import {
  VIEWBOX,
  ESCENARIO_PATHS,
  ESCENARIO_LABEL,
  COLOR_OCUPADO,
  COLOR_SELECCIONADO,
  COLOR_FILA,
  NIVEL_COLOR,
  type Butaca,
  type Zona,
} from '@/lib/asientos';

// Color visual de la zona en el mapa (por fila, ver COLOR_FILA) — distinto
// del color de nivel de precio, que solo se usa en la leyenda/carrito.
const colorZona = (zona: Zona) => COLOR_FILA[zona.id[0]] ?? NIVEL_COLOR[zona.nivel];

interface TeatroSeatMapProps {
  butacas: Butaca[];
  zonas: Zona[];
  seleccionadas: Set<string>;
  onToggle: (butaca: Butaca) => void;
}

const MIN_SCALE = 0.6;
const MAX_SCALE = 10;
const ANCHO_BUTACA = 3.8;
const ALTO_BUTACA = 4.4;
const DURACION_ANIMACION = 450; // ms, al enfocar/salir de una zona

// Cuánto del viewBox original debe seguir visible como mínimo al desplazar o
// hacer zoom, para que el mapa se pueda recorrer libremente sin "perderse"
// fuera de cuadro (nunca se desborda del contenedor: la clave de esto es el
// clamp, no el overflow-hidden del contenedor que ya lo recorta visualmente).
const MARGEN_VISIBLE_PAN = 120;
const clamp = (valor: number, min: number, max: number) => Math.min(max, Math.max(min, valor));

function limitarPan(x: number, y: number, scale: number) {
  const anchoContenido = VIEWBOX.width * scale;
  const altoContenido = VIEWBOX.height * scale;
  return {
    x: clamp(x, MARGEN_VISIBLE_PAN - anchoContenido, VIEWBOX.width - MARGEN_VISIBLE_PAN),
    y: clamp(y, MARGEN_VISIBLE_PAN - altoContenido, VIEWBOX.height - MARGEN_VISIBLE_PAN),
  };
}

export function TeatroSeatMap({ butacas, zonas, seleccionadas, onToggle }: TeatroSeatMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);

  // Vista de "zonas" (sectores completos, sin butacas) vs. "asientos"
  // (butacas individuales del sector en el que se hizo click).
  const [modo, setModo] = useState<'zonas' | 'asientos'>('zonas');
  const [sectorActivo, setSectorActivo] = useState<string | null>(null);

  // El transform del <g> se muta directo por DOM (sin pasar por React) para
  // que animar el foco de zona no re-renderice las ~3600 butacas en cada frame.
  const transform = useRef({ x: 0, y: 0, scale: 1 });

  // Estado del arrastre (pan) y del pinch-zoom (2 dedos). Todo en refs, no
  // useState, por la misma razón que `transform`: mutar el DOM directo en
  // cada frame de mousemove/touchmove sin re-renderizar las ~3600 butacas.
  const arrastrando = useRef(false);
  const huboArrastre = useRef(false);
  const inicioPuntero = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  // Todos los dedos activos ahora mismo (por pointerId) — con 2 se arma un
  // pinch; al soltar uno durante un pinch, el que queda retoma el paneo.
  const punteros = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ distancia: number; escala: number } | null>(null);

  const aplicarTransform = () => {
    const { x, y, scale } = transform.current;
    groupRef.current?.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);
  };

  const detenerAnimacion = () => {
    if (groupRef.current) groupRef.current.style.transition = 'none';
  };

  // Anima el transform hacia un destino (usado al enfocar una zona o volver
  // a la vista general). El zoom manual no pasa por acá — por eso se apaga
  // la transición apenas el usuario vuelve a interactuar.
  const animarTransformA = (destino: { x: number; y: number; scale: number }) => {
    if (groupRef.current) {
      groupRef.current.style.transition = `transform ${DURACION_ANIMACION}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    }
    const { x, y } = limitarPan(destino.x, destino.y, destino.scale);
    transform.current = { x, y, scale: destino.scale };
    aplicarTransform();
    window.setTimeout(detenerAnimacion, DURACION_ANIMACION);
  };

  const enfocarZona = (zona: Zona) => {
    const ancho = zona.bbox.x1 - zona.bbox.x0;
    const alto = zona.bbox.y1 - zona.bbox.y0;
    const escalaAjuste = Math.min(VIEWBOX.width / ancho, VIEWBOX.height / alto) * 0.82;
    const nuevaEscala = Math.min(MAX_SCALE, Math.max(MIN_SCALE, escalaAjuste));
    const cx = (zona.bbox.x0 + zona.bbox.x1) / 2;
    const cy = (zona.bbox.y0 + zona.bbox.y1) / 2;
    animarTransformA({
      x: VIEWBOX.width / 2 - cx * nuevaEscala,
      y: VIEWBOX.height / 2 - cy * nuevaEscala,
      scale: nuevaEscala,
    });
    setSectorActivo(zona.id);
    setModo('asientos');
  };

  const volverAZonas = () => {
    animarTransformA({ x: 0, y: 0, scale: 1 });
    setModo('zonas');
    setSectorActivo(null);
  };

  // Acerca/aleja manteniendo fijo un punto dado (en coordenadas del viewBox
  // exterior, 0..1000 / 0..700). Los botones +/- pivotean sobre el centro;
  // la rueda del mouse pivotea sobre el cursor, para poder ubicar butacas
  // puntuales sin que el mapa "se escape" del punto que estás mirando.
  const zoomEn = (factor: number, pivotX = VIEWBOX.width / 2, pivotY = VIEWBOX.height / 2) => {
    detenerAnimacion();
    const t = transform.current;
    const nuevaEscala = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor));
    if (nuevaEscala === t.scale) return;
    const contenidoX = (pivotX - t.x) / t.scale;
    const contenidoY = (pivotY - t.y) / t.scale;
    const { x, y } = limitarPan(pivotX - contenidoX * nuevaEscala, pivotY - contenidoY * nuevaEscala, nuevaEscala);
    t.x = x;
    t.y = y;
    t.scale = nuevaEscala;
    aplicarTransform();
  };

  // Zoom con la rueda del mouse, centrado en el cursor. Se agrega con
  // addEventListener nativo (no JSX onWheel) porque React marca ese listener
  // como pasivo por defecto: un preventDefault() adentro de un onWheel de
  // React no evita el scroll de la página y tira un warning en consola.
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svgEl.getBoundingClientRect();
      const escalaRender = Math.min(rect.width / VIEWBOX.width, rect.height / VIEWBOX.height) || 1;
      const offsetX = (rect.width - VIEWBOX.width * escalaRender) / 2;
      const offsetY = (rect.height - VIEWBOX.height * escalaRender) / 2;
      const pivotX = (e.clientX - rect.left - offsetX) / escalaRender;
      const pivotY = (e.clientY - rect.top - offsetY) / escalaRender;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      zoomEn(factor, pivotX, pivotY);
    };

    svgEl.addEventListener('wheel', onWheel, { passive: false });
    return () => svgEl.removeEventListener('wheel', onWheel);
  }, []);

  const handleSeatClick = (e: React.MouseEvent, b: Butaca) => {
    e.stopPropagation();
    if (huboArrastre.current) return;
    if (!b.ocupada) onToggle(b);
  };

  const handleZonaClick = (e: React.MouseEvent, zona: Zona) => {
    e.stopPropagation();
    if (huboArrastre.current) return;
    enfocarZona(zona);
  };

  // Click en cualquier parte del mapa que no sea una butaca (fondo, otras
  // zonas atenuadas, el escenario) mientras estás dentro de una zona: vuelve
  // a la vista de sectores, para no depender solo del botón "Volver".
  const handleFondoClick = () => {
    if (huboArrastre.current) return;
    if (modo === 'asientos') volverAZonas();
  };

  const distanciaEntre = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  // Convierte coordenadas de pantalla (clientX/Y) a coordenadas del viewBox
  // interior — lo mismo que hace el wheel-zoom para pivotear sobre el cursor,
  // acá se usa para pivotear el pinch sobre el punto medio entre los 2 dedos.
  const puntoDelViewport = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const escalaRender = Math.min(rect.width / VIEWBOX.width, rect.height / VIEWBOX.height) || 1;
    const offsetX = (rect.width - VIEWBOX.width * escalaRender) / 2;
    const offsetY = (rect.height - VIEWBOX.height * escalaRender) / 2;
    return { x: (clientX - rect.left - offsetX) / escalaRender, y: (clientY - rect.top - offsetY) / escalaRender };
  };

  // Arrastre (1 dedo/mouse) y pinch-zoom (2 dedos) para desplazar y acercar
  // el mapa en touch. Pointer Events unifica mouse y touch en un solo set de
  // handlers; todo muta el transform por DOM (igual que el wheel-zoom) para
  // no re-renderizar las butacas en cada frame.
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    detenerAnimacion();
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (punteros.current.size === 2) {
      arrastrando.current = false;
      huboArrastre.current = true; // 2 dedos nunca es un click/tap simple
      const [p1, p2] = [...punteros.current.values()];
      pinch.current = { distancia: distanciaEntre(p1, p2), escala: transform.current.scale };
      for (const id of punteros.current.keys()) e.currentTarget.setPointerCapture(id);
      return;
    }

    if (punteros.current.size > 2) return; // un tercer dedo no hace nada

    arrastrando.current = true;
    huboArrastre.current = false;
    inicioPuntero.current = {
      x: e.clientX,
      y: e.clientY,
      tx: transform.current.x,
      ty: transform.current.y,
    };
    // OJO: la captura del puntero se pide recién en handlePointerMove, al
    // confirmar que hay arrastre real (superó el umbral). Pedirla acá, en el
    // pointerdown, retargetea también el click nativo hacia el <svg> — y con
    // eso el click nunca le llega a la butaca/zona bajo el cursor, rompiendo
    // la selección con un simple click/tap sin arrastre.
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!punteros.current.has(e.pointerId)) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch.current && punteros.current.size >= 2) {
      const [p1, p2] = [...punteros.current.values()];
      const factor = distanciaEntre(p1, p2) / pinch.current.distancia;
      const nuevaEscala = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinch.current.escala * factor));
      const centro = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const pivot = puntoDelViewport(centro.x, centro.y);
      const t = transform.current;
      const contenidoX = (pivot.x - t.x) / t.scale;
      const contenidoY = (pivot.y - t.y) / t.scale;
      const { x, y } = limitarPan(pivot.x - contenidoX * nuevaEscala, pivot.y - contenidoY * nuevaEscala, nuevaEscala);
      t.x = x;
      t.y = y;
      t.scale = nuevaEscala;
      aplicarTransform();
      return;
    }

    if (!arrastrando.current) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;

    if (!huboArrastre.current) {
      const distancia = Math.hypot(
        e.clientX - inicioPuntero.current.x,
        e.clientY - inicioPuntero.current.y
      );
      if (distancia <= 4) return;
      huboArrastre.current = true;
      svgEl.setPointerCapture(e.pointerId);
    }

    const rect = svgEl.getBoundingClientRect();
    const escalaRender = Math.min(rect.width / VIEWBOX.width, rect.height / VIEWBOX.height) || 1;
    const deltaX = (e.clientX - inicioPuntero.current.x) / escalaRender;
    const deltaY = (e.clientY - inicioPuntero.current.y) / escalaRender;
    const { x, y } = limitarPan(
      inicioPuntero.current.tx + deltaX,
      inicioPuntero.current.ty + deltaY,
      transform.current.scale
    );
    transform.current.x = x;
    transform.current.y = y;
    aplicarTransform();
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    punteros.current.delete(e.pointerId);
    arrastrando.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (punteros.current.size < 2) pinch.current = null;

    if (punteros.current.size === 1) {
      // Queda un dedo tras terminar un pinch: retoma el paneo desde ahí en
      // vez de esperar un pointerdown nuevo, para que no haya un salto.
      const [[, pos]] = [...punteros.current.entries()];
      arrastrando.current = true;
      huboArrastre.current = true;
      inicioPuntero.current = { x: pos.x, y: pos.y, tx: transform.current.x, ty: transform.current.y };
    }
  };

  const zonaActiva = zonas.find((z) => z.id === sectorActivo) ?? null;

  return (
    <div className="relative h-full w-full">
      {modo === 'asientos' && (
        <button
          type="button"
          onClick={volverAZonas}
          className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-(--border) bg-white/90 px-3 py-2 text-sm font-semibold text-(--text-primary) shadow-sm backdrop-blur-md transition-colors hover:border-[#1e63b8]/40 hover:bg-[#1e63b8]/5"
        >
          <ChevronLeft size={16} />
          Volver a sectores
        </button>
      )}

      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => zoomEn(1.5)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border) bg-white/90 text-(--text-primary) shadow-sm backdrop-blur-md transition-colors hover:border-[#1e63b8]/40 hover:bg-[#1e63b8]/5"
          aria-label="Acercar"
        >
          <ZoomIn size={18} />
        </button>
        <button
          type="button"
          onClick={() => zoomEn(1 / 1.5)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border) bg-white/90 text-(--text-primary) shadow-sm backdrop-blur-md transition-colors hover:border-[#1e63b8]/40 hover:bg-[#1e63b8]/5"
          aria-label="Alejar"
        >
          <ZoomOut size={18} />
        </button>
      </div>

      {modo === 'zonas' && (
        <p className="absolute bottom-3 left-3 z-10 max-w-[85%] text-xs text-(--text-muted)">
          Tocá un sector para ver y elegir sus butacas.
        </p>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        onClick={handleFondoClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <radialGradient id="pisoTeatro" cx="50%" cy="82%" r="85%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#f7f2e7" />
            <stop offset="100%" stopColor="#ede2c8" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#pisoTeatro)" />

        <g ref={groupRef}>
          {ESCENARIO_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="rgba(217, 138, 30, 0.15)"
              stroke="#d98a1e"
              strokeWidth={1.5}
            />
          ))}
          <text
            x={ESCENARIO_LABEL.x}
            y={ESCENARIO_LABEL.y + 5}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            letterSpacing="0.15em"
            fill="#8a5a12"
          >
            ESCENARIO
          </text>

          {modo === 'zonas' &&
            zonas.map((z) => (
              <g
                key={z.id}
                onClick={(e) => handleZonaClick(e, z)}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                <path
                  d={z.path}
                  fill={colorZona(z)}
                  fillOpacity={0.28}
                  stroke={colorZona(z)}
                  strokeOpacity={0.7}
                  strokeWidth={1.5}
                />
                <text
                  x={z.centro.x}
                  y={z.centro.y + 8}
                  textAnchor="middle"
                  fontSize={26}
                  fontWeight={800}
                  fill="#1b2a4a"
                >
                  {z.label}
                </text>
              </g>
            ))}

          {modo === 'asientos' && (
            <>
              {zonas
                .filter((z) => z.id !== sectorActivo)
                .map((z) => (
                  <path key={z.id} d={z.path} fill={colorZona(z)} fillOpacity={0.05} stroke="none" />
                ))}

              {zonaActiva && (
                // Todo el interior de la zona activa frena el click acá: no
                // debe "salir" al panorama general salvo que el click caiga
                // realmente afuera de este contorno.
                <g onClick={(e) => e.stopPropagation()}>
                  <path
                    d={zonaActiva.path}
                    fill={colorZona(zonaActiva)}
                    fillOpacity={0.18}
                    stroke={colorZona(zonaActiva)}
                    strokeOpacity={0.6}
                    strokeWidth={1.2}
                  />
                  <text
                    x={zonaActiva.centro.x}
                    y={zonaActiva.centro.y + 8}
                    textAnchor="middle"
                    fontSize={30}
                    fontWeight={800}
                    fill={colorZona(zonaActiva)}
                    opacity={0.15}
                  >
                    {zonaActiva.label}
                  </text>
                  {butacas.filter((b) => b.sectorId === sectorActivo).length === 0 && (
                    <text
                      x={zonaActiva.centro.x}
                      y={zonaActiva.centro.y + 40}
                      textAnchor="middle"
                      fontSize={13}
                      fill="#1b2a4a"
                      opacity={0.55}
                    >
                      Butacas de este sector: próximamente
                    </text>
                  )}
                </g>
              )}

              {(() => {
                const butacasSector = butacas.filter((b) => b.sectorId === sectorActivo);
                const primeraPorFila = new Map<number, Butaca>();
                for (const b of butacasSector) {
                  const actual = primeraPorFila.get(b.fila);
                  if (!actual || b.x < actual.x) primeraPorFila.set(b.fila, b);
                }
                return (
                  <g onClick={(e) => e.stopPropagation()}>
                    {[...primeraPorFila.values()].map((b) => (
                      <text
                        key={`fila-${b.fila}`}
                        x={b.x - 6}
                        y={b.y + 1}
                        textAnchor="end"
                        fontSize={4}
                        fontWeight={800}
                        fill="#1b2a4a"
                        opacity={0.6}
                      >
                        {b.letra}
                      </text>
                    ))}
                    {butacasSector.map((b) => {
                      const estaSeleccionada = seleccionadas.has(b.id);
                      const fill = b.ocupada
                        ? COLOR_OCUPADO
                        : estaSeleccionada
                          ? COLOR_SELECCIONADO
                          : NIVEL_COLOR[b.nivel];

                      return (
                        <g
                          key={b.id}
                          transform={`rotate(${b.angulo} ${b.x} ${b.y})`}
                          className={b.ocupada ? 'cursor-not-allowed' : 'cursor-pointer'}
                          onClick={(e) => handleSeatClick(e, b)}
                        >
                          <rect
                            x={b.x - ANCHO_BUTACA / 2}
                            y={b.y - ALTO_BUTACA / 2}
                            width={ANCHO_BUTACA}
                            height={ALTO_BUTACA}
                            rx={1}
                            fill={fill}
                            opacity={b.ocupada ? 0.7 : 1}
                            stroke={estaSeleccionada ? '#1b2a4a' : 'transparent'}
                            strokeWidth={0.6}
                          />
                          <text
                            x={b.x}
                            y={b.y + 0.7}
                            textAnchor="middle"
                            fontSize={2.1}
                            fontWeight={700}
                            fill="#170406"
                            pointerEvents="none"
                          >
                            {b.numero}
                          </text>
                          <title>
                            {`Sector ${b.sectorLabel} · ${b.codigo}${
                              b.ocupada ? ' · Ocupado' : ''
                            }`}
                          </title>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
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
    transform.current = destino;
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
    t.x = pivotX - contenidoX * nuevaEscala;
    t.y = pivotY - contenidoY * nuevaEscala;
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
    if (!b.ocupada) onToggle(b);
  };

  const handleZonaClick = (e: React.MouseEvent, zona: Zona) => {
    e.stopPropagation();
    enfocarZona(zona);
  };

  // Click en cualquier parte del mapa que no sea una butaca (fondo, otras
  // zonas atenuadas, el escenario) mientras estás dentro de una zona: vuelve
  // a la vista de sectores, para no depender solo del botón "Volver".
  const handleFondoClick = () => {
    if (modo === 'asientos') volverAZonas();
  };

  const zonaActiva = zonas.find((z) => z.id === sectorActivo) ?? null;

  return (
    <div className="relative h-full w-full">
      {modo === 'asientos' && (
        <button
          type="button"
          onClick={volverAZonas}
          className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-[#e0a527]/30 bg-[#170406]/85 px-3 py-2 text-sm font-semibold text-[#f4c94f] transition-colors hover:bg-[#e0a527]/15"
        >
          <ChevronLeft size={16} />
          Volver a sectores
        </button>
      )}

      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => zoomEn(1.5)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0a527]/30 bg-[#170406]/85 text-[#f4c94f] transition-colors hover:bg-[#e0a527]/15"
          aria-label="Acercar"
        >
          <ZoomIn size={18} />
        </button>
        <button
          type="button"
          onClick={() => zoomEn(1 / 1.5)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0a527]/30 bg-[#170406]/85 text-[#f4c94f] transition-colors hover:bg-[#e0a527]/15"
          aria-label="Alejar"
        >
          <ZoomOut size={18} />
        </button>
      </div>

      {modo === 'zonas' && (
        <p className="absolute bottom-3 left-3 z-10 max-w-[85%] text-xs text-white/40">
          Tocá un sector para ver y elegir sus butacas.
        </p>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full touch-none select-none"
        onClick={handleFondoClick}
      >
        <defs>
          <radialGradient id="pisoTeatro" cx="50%" cy="82%" r="85%">
            <stop offset="0%" stopColor="#3a0d14" />
            <stop offset="55%" stopColor="#22060a" />
            <stop offset="100%" stopColor="#0c0203" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#pisoTeatro)" />

        <g ref={groupRef}>
          {ESCENARIO_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="rgba(224, 165, 39, 0.15)"
              stroke="#e0a527"
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
            fill="#f4c94f"
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
                  fill="#fdf6ec"
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
                      fill="#fdf6ec"
                      opacity={0.6}
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
                        fill="#fdf6ec"
                        opacity={0.7}
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
                            opacity={b.ocupada ? 0.55 : 1}
                            stroke={estaSeleccionada ? '#fff' : 'transparent'}
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
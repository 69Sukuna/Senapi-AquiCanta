import Image from 'next/image';

interface EventoProgreso {
  id: string;
  nombre: string;
  orden: number;
  completado: boolean;
}

interface RielProgresoProps {
  eventos: EventoProgreso[];
}

const META_URL = '/sellos/BARRA DE PROGRESO TREN/B_ACB BADGE.png';

// Locomotora de perfil, dibujada en SVG — reemplaza el badge circular:
// las ruedas quedan a la altura del riel de abajo (ver `bottom` donde se
// usa), como si de verdad estuviera parada sobre la vía.
function Locomotora() {
  return (
    <svg viewBox="0 0 56 40" className="h-full w-full overflow-visible">
      {/* humo */}
      <circle cx="44" cy="7" r="3" fill="#d8d3c9" opacity="0.75" />
      <circle cx="47.5" cy="2.5" r="2.1" fill="#e6e2d8" opacity="0.6" />
      {/* chimenea */}
      <rect x="41" y="10" width="4" height="8" rx="1" fill="var(--accent-gold)" />
      {/* cabina */}
      <rect x="6" y="8" width="16" height="15" rx="2" fill="#8f1710" />
      <rect x="9" y="11" width="6" height="6" rx="1" fill="#f4ecd8" />
      {/* cuerpo */}
      <rect x="18" y="16" width="30" height="10" rx="3" fill="#8f1710" />
      <circle cx="49" cy="21" r="2.4" fill="var(--accent-gold)" />
      {/* ruedas */}
      <circle cx="14" cy="33" r="5.5" fill="#2b2b2b" />
      <circle cx="14" cy="33" r="2" fill="#9099a3" />
      <circle cx="34" cy="33" r="5.5" fill="#2b2b2b" />
      <circle cx="34" cy="33" r="2" fill="#9099a3" />
      <circle cx="44" cy="33" r="4" fill="#2b2b2b" />
      <circle cx="44" cy="33" r="1.4" fill="#9099a3" />
    </svg>
  );
}

// Rieles de tren dibujados en SVG (dos rieles metálicos + durmientes de
// madera) en vez de la cápsula lisa — no depende de ningún archivo de
// imagen, así que se estira parejo a cualquier ancho sin recortes raros.
function ViaDeTren() {
  return (
    <svg viewBox="0 0 800 40" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <pattern id="durmientes-sellos" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="13" y="3" width="14" height="34" rx="2" fill="#6b4a2f" />
          <rect x="13" y="3" width="14" height="6" rx="2" fill="#7d5a3a" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="800" height="40" fill="url(#durmientes-sellos)" />
      <rect x="0" y="7" width="800" height="6" rx="2" fill="#7a828c" />
      <rect x="0" y="7" width="800" height="2" rx="1" fill="#c7ccd1" />
      <rect x="0" y="27" width="800" height="6" rx="2" fill="#7a828c" />
      <rect x="0" y="27" width="800" height="2" rx="1" fill="#c7ccd1" />
    </svg>
  );
}

// Posición de cada evento a lo largo de la vía, repartidos parejo entre 0% y
// 100% — funciona igual con 1 evento (queda centrado) que con muchos.
function posicionDe(indice: number, total: number): number {
  if (total <= 1) return 50;
  return (indice / (total - 1)) * 100;
}

// Vía de tren: la cantidad de eventos no es fija (hoy puede ser 1 solo, ej.
// FRIKICON, y más adelante crecer) — todo acá se calcula a partir de
// `eventos.length`, nada asume una cantidad de paradas de antemano.
export function RielProgreso({ eventos }: RielProgresoProps) {
  const ordenados = eventos.slice().sort((a, b) => a.orden - b.orden);
  const total = ordenados.length;
  const completados = ordenados.filter((e) => e.completado).length;
  const porcentajeTren = total > 0 ? (completados / total) * 100 : 0;

  return (
    <div>
      <p className="mb-3! text-sm font-semibold text-(--text-primary)">
        ¡Observa en qué evento va el tren rumbo a Aquí Canta Bolivia 2026!
      </p>

      {/* Contenedor de alto fijo: el tren y las paradas, ubicados con
          top-1/2, quedan centrados en los rieles sin ningún cálculo de
          proporción de por medio. */}
      <div className="relative h-10 w-full">
        <ViaDeTren />

        <div
          className="absolute h-14 w-20 min-w-16 -translate-x-1/2 transition-[left] duration-500 ease-out"
          style={{ left: `${Math.max(6, Math.min(94, porcentajeTren))}%`, bottom: '7px' }}
          role="img"
          aria-label="Posición actual"
        >
          <Locomotora />
        </div>

        <div className="absolute right-[1%] h-10 w-10 min-h-8 min-w-8" style={{ bottom: '7px' }}>
          <Image src={META_URL} alt="Meta: Aquí Canta Bolivia 2026" fill className="object-contain" />
        </div>

        {/* Una parada por evento real, sin importar cuántos haya */}
        {ordenados.map((evento, i) => (
          <span
            key={evento.id}
            className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 ${
              evento.completado ? 'bg-(--accent-gold)' : 'bg-white/60'
            }`}
            style={{ left: `${posicionDe(i, total)}%` }}
          />
        ))}
      </div>

      <div className="relative mt-2! h-4">
        {/* La primera y última etiqueta se anclan por su borde (no por el
            centro) — centradas con `left: 0%`/`100%` quedaban con la mitad
            del texto recortada contra el borde de la tarjeta en pantallas
            angostas (celular). */}
        {ordenados.map((evento, i) => {
          const esPrimero = i === 0;
          const esUltimo = i === total - 1;
          return (
            <span
              key={evento.id}
              className={`absolute max-w-24 text-xs whitespace-nowrap ${esPrimero ? 'text-left' : esUltimo ? 'text-right' : 'text-center'} ${
                evento.completado ? 'font-semibold text-(--accent-green)' : 'text-(--text-secondary)'
              }`}
              style={{
                left: `${posicionDe(i, total)}%`,
                transform: esPrimero ? 'translateX(0)' : esUltimo ? 'translateX(-100%)' : 'translateX(-50%)',
              }}
            >
              {evento.nombre}
            </span>
          );
        })}
      </div>
    </div>
  );
}

import Link from 'next/link';

interface CategoriaCardProps {
  id: string;
  nombre: string;
}

// Paleta reutilizada de .tema-votacion (globals.css): rojo carmesí + mostaza.
// Se aplica acá vía valores arbitrarios de Tailwind para no tocar el CSS
// compartido — coordinar con el equipo si esto se vuelve un patrón común.
//
// Ojo con `p-6!`: el globals.css actual tiene reglas viejas (`* { margin:0;
// padding:0 }`, `a { color: inherit }`) fuera de cualquier @layer, y en CSS
// una regla sin capa siempre le gana a las utilidades de Tailwind (que sí
// están en capas), sin importar especificidad. El sufijo `!` de Tailwind v4
// fuerza !important para ganar esa pelea. Aplica solo a margin/padding y a
// color/subrayado puesto directo sobre un <a>; todo lo demás no se ve afectado.
export function CategoriaCard({ id, nombre }: CategoriaCardProps) {
  return (
    <Link
      href={`/categorias/${id}`}
      className="group relative flex flex-col justify-between gap-5 overflow-hidden rounded-3xl border border-[rgba(224,165,39,0.18)] bg-[rgba(40,10,15,0.55)] p-6! backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(224,165,39,0.55)] hover:bg-[rgba(60,14,20,0.7)] hover:shadow-[0_20px_45px_-15px_rgba(225,29,46,0.45)]"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#f4c94f] to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-80" />

      <h3 className="text-lg leading-snug font-bold text-[#fdf6ec]">{nombre}</h3>

      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f4c94f] transition-transform duration-300 group-hover:translate-x-1.5">
        Ver participantes
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

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
      className="group relative flex flex-col justify-between gap-5 overflow-hidden rounded-3xl border border-(--border) bg-white p-6! shadow-[0_1px_2px_rgba(27,42,74,0.06),0_10px_24px_-12px_rgba(27,42,74,0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1e63b8]/35 hover:shadow-[0_20px_45px_-15px_rgba(27,42,74,0.22)]"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

      <h3 className="text-lg leading-snug font-bold text-(--text-primary)">{nombre}</h3>

      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e63b8] transition-transform duration-300 group-hover:translate-x-1.5">
        Ver participantes
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

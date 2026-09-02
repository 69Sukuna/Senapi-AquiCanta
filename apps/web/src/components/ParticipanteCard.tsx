import Link from 'next/link';
import Image from 'next/image';
import { DepartamentoBadge } from '@/components/DepartamentoBadge';

interface ParticipanteCardProps {
  tipo: 'CANTANTE' | 'GRUPO';
  id: string;
  nombre: string;
  fotoUrl: string | null;
  categoriaNombre?: string;
  departamento?: string | null;
  integrantesCount?: number;
}

// Tarjeta compartida del catálogo unificado de participantes (solistas +
// grupos): enlaza a /cantante/:id o /grupo/:id según el tipo. La usan tanto
// /cantante (catálogo de Participantes) como categorias/[id] (participantes
// de una categoría).
export function ParticipanteCard({
  tipo,
  id,
  nombre,
  fotoUrl,
  categoriaNombre,
  departamento,
  integrantesCount,
}: ParticipanteCardProps) {
  const href = tipo === 'CANTANTE' ? `/cantante/${id}` : `/grupo/${id}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-(--border) bg-white p-6! shadow-[0_1px_2px_rgba(27,42,74,0.06),0_10px_24px_-12px_rgba(27,42,74,0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1e63b8]/35 hover:shadow-[0_20px_45px_-15px_rgba(27,42,74,0.22)]"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-[#1b2a4a]/5">
        {fotoUrl && <Image src={fotoUrl} alt={nombre} fill sizes="300px" className="object-cover" />}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex! rounded-full border border-[#1e63b8]/25 bg-[#1e63b8]/8 px-2.5! py-0.5! text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#164a8c]">
            {tipo === 'CANTANTE' ? 'Solista' : 'Grupo'}
          </span>
          {categoriaNombre && (
            <span className="inline-flex! rounded-full border border-[#1e63b8]/25 bg-[#1e63b8]/8 px-2.5! py-0.5! text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#164a8c]">
              {categoriaNombre}
            </span>
          )}
          <DepartamentoBadge departamento={departamento} className="px-2.5! py-0.5! text-[0.65rem]" />
        </div>
        <h3 className="mt-2.5! text-lg leading-snug font-bold text-(--text-primary)">{nombre}</h3>
        {tipo === 'GRUPO' && integrantesCount !== undefined && (
          <p className="mt-1! text-sm text-(--text-secondary)">
            {integrantesCount} {integrantesCount === 1 ? 'integrante' : 'integrantes'}
          </p>
        )}
      </div>
    </Link>
  );
}

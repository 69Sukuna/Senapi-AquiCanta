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
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-[rgba(224,165,39,0.18)] bg-[rgba(40,10,15,0.55)] p-6! backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(224,165,39,0.55)] hover:bg-[rgba(60,14,20,0.7)] hover:shadow-[0_20px_45px_-15px_rgba(225,29,46,0.45)]"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#f4c94f] to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-80" />

      <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-[rgba(0,0,0,0.3)]">
        {fotoUrl && <Image src={fotoUrl} alt={nombre} fill sizes="300px" className="object-cover" />}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex! rounded-full border border-[rgba(224,165,39,0.35)] bg-[rgba(224,165,39,0.1)] px-2.5! py-0.5! text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#f4c94f]">
            {tipo === 'CANTANTE' ? 'Solista' : 'Grupo'}
          </span>
          {categoriaNombre && (
            <span className="inline-flex! rounded-full border border-[rgba(224,165,39,0.35)] bg-[rgba(224,165,39,0.1)] px-2.5! py-0.5! text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#f4c94f]">
              {categoriaNombre}
            </span>
          )}
          <DepartamentoBadge departamento={departamento} className="px-2.5! py-0.5! text-[0.65rem]" />
        </div>
        <h3 className="mt-2.5! text-lg leading-snug font-bold text-[#fdf6ec]">{nombre}</h3>
        {tipo === 'GRUPO' && integrantesCount !== undefined && (
          <p className="mt-1! text-sm text-[rgba(253,246,236,0.55)]">
            {integrantesCount} {integrantesCount === 1 ? 'integrante' : 'integrantes'}
          </p>
        )}
      </div>
    </Link>
  );
}

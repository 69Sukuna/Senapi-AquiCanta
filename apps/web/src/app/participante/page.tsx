import { notFound } from 'next/navigation';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { ParticipantesExplorer } from './_components/ParticipantesExplorer';

interface Cantante {
  id: string;
  nombre: string;
  fotoUrl: string | null;
  departamento: string | null;
  categoria: { id: string; nombre: string };
}

interface Grupo {
  id: string;
  nombre: string;
  fotoUrl: string | null;
  departamento: string | null;
  categoria: { id: string; nombre: string };
  integrantes: unknown[];
}

interface Categoria {
  id: string;
  nombre: string;
}

export interface Participante {
  tipo: 'CANTANTE' | 'GRUPO';
  id: string;
  nombre: string;
  fotoUrl: string | null;
  departamento: string | null;
  categoria: { id: string; nombre: string };
  integrantesCount?: number;
}

async function getCantantes(): Promise<Cantante[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/cantantes`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getGrupos(): Promise<Grupo[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/grupos`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCategorias(): Promise<Categoria[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/categorias`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ParticipantesPage() {
  if (!FEATURE_FLAGS.participantes) {
    notFound();
  }

  const [cantantes, grupos, categorias] = await Promise.all([getCantantes(), getGrupos(), getCategorias()]);

  // Catálogo unificado: solistas y grupos conviven en una sola lista, cada
  // uno con su `tipo` para poder distinguirlos y enlazar a su ficha propia
  // (/cantante/:id o /grupo/:id).
  const participantes: Participante[] = [
    ...cantantes.map((c) => ({ ...c, tipo: 'CANTANTE' as const })),
    ...grupos.map((g) => ({ ...g, tipo: 'GRUPO' as const, integrantesCount: g.integrantes.length })),
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg-primary)">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#f0a83e] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#1e63b8] opacity-[0.1] blur-3xl" />

      <div className="relative mx-auto! max-w-7xl px-6! py-16! sm:px-10! lg:py-20!">
        <span className="badge badge-gold inline-flex! w-fit">
          <span className="pulse-dot" />
          Aqui Canta Bolivia
        </span>

        <h1 className="mt-2! text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.5] font-extrabold tracking-tight text-(--text-primary)">
          Participantes
        </h1>
        <p className="mt-2! max-w-2xl text-base text-(--text-secondary) sm:text-lg">
          Conoce a los solistas y agrupaciones inscritos en el concurso.
        </p>

        {participantes.length > 0 ? (
          <ParticipantesExplorer participantes={participantes} categorias={categorias} />
        ) : (
          <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
            Todavía no hay participantes inscritos.
          </div>
        )}
      </div>
    </main>
  );
}

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
  const [cantantes, grupos, categorias] = await Promise.all([getCantantes(), getGrupos(), getCategorias()]);

  // Catálogo unificado: solistas y grupos conviven en una sola lista, cada
  // uno con su `tipo` para poder distinguirlos y enlazar a su ficha propia
  // (/cantante/:id o /grupo/:id).
  const participantes: Participante[] = [
    ...cantantes.map((c) => ({ ...c, tipo: 'CANTANTE' as const })),
    ...grupos.map((g) => ({ ...g, tipo: 'GRUPO' as const, integrantesCount: g.integrantes.length })),
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(165deg,#3d0a13_0%,#1f0407_55%,#0a0102_100%)]">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#e0a527] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#ff4d5e] opacity-[0.14] blur-3xl" />

      <div className="relative mx-auto! max-w-7xl px-6! py-16! sm:px-10! lg:py-20!">
        <span className="inline-flex! items-center gap-2 rounded-full border border-[rgba(224,165,39,0.4)] bg-[rgba(224,165,39,0.1)] px-4! py-1.5! text-xs font-bold uppercase tracking-[0.14em] text-[#f4c94f]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f4c94f]" />
          Aqui Canta Bolivia
        </span>

        <h1 className="mt-2! text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.5] font-extrabold tracking-tight bg-gradient-to-r from-[#fdf6ec] via-[#f4c94f] to-[#ff4d5e] bg-clip-text text-transparent">
          Participantes
        </h1>
        <p className="mt-2! max-w-2xl text-base text-[rgba(253,246,236,0.74)] sm:text-lg">
          Conoce a los solistas y agrupaciones inscritos en el concurso.
        </p>

        {participantes.length > 0 ? (
          <ParticipantesExplorer participantes={participantes} categorias={categorias} />
        ) : (
          <div className="mt-12! rounded-2xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
            Todavía no hay participantes inscritos.
          </div>
        )}
      </div>
    </main>
  );
}

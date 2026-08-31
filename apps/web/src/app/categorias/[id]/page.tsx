import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ParticipanteCard } from '../_components/ParticipanteCard';

interface Categoria {
  id: string;
  nombre: string;
}

interface Cantante {
  id: string;
  nombre: string;
  fotoUrl: string | null;
  departamento: string | null;
  categoria: { id: string };
}

interface Grupo {
  id: string;
  nombre: string;
  fotoUrl: string | null;
  departamento: string | null;
  categoria: { id: string };
  integrantes: unknown[];
}

async function getCategoria(id: string): Promise<Categoria | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/categorias/${id}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('No se pudo cargar la categoría');
    return res.json();
  } catch {
    return null;
  }
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

interface CategoriaDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoriaDetallePage({ params }: CategoriaDetallePageProps) {
  const { id } = await params;
  const [categoria, cantantes, grupos] = await Promise.all([getCategoria(id), getCantantes(), getGrupos()]);

  if (!categoria) {
    notFound();
  }

  const cantantesDeCategoria = cantantes.filter((c) => c.categoria.id === id);
  const gruposDeCategoria = grupos.filter((g) => g.categoria.id === id);
  const totalParticipantes = cantantesDeCategoria.length + gruposDeCategoria.length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(165deg,#3d0a13_0%,#1f0407_55%,#0a0102_100%)]">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#e0a527] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#ff4d5e] opacity-[0.14] blur-3xl" />

      <div className="relative mx-auto! max-w-7xl px-6! py-16! sm:px-10! lg:py-20!">
        <Link
          href="/categorias"
          className="flex! w-fit items-center gap-1.5 text-sm font-semibold text-[#f4c94f]! transition-transform duration-200 hover:translate-x-[-2px] hover:underline!"
        >
          <span aria-hidden="true">←</span> Todas las categorías
        </Link>

        <span className="mt-8! inline-flex! items-center gap-2 rounded-full border border-[rgba(224,165,39,0.4)] bg-[rgba(224,165,39,0.1)] px-4! py-1.5! text-xs font-bold uppercase tracking-[0.14em] text-[#f4c94f]">
          Categoría
        </span>

        <h1 className="mt-5! text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.2] font-extrabold tracking-tight bg-gradient-to-r from-[#fdf6ec] via-[#f4c94f] to-[#ff4d5e] bg-clip-text text-transparent">
          {categoria.nombre}
        </h1>
        <p className="mt-2! text-[rgba(253,246,236,0.6)]">
          {totalParticipantes} {totalParticipantes === 1 ? 'participante' : 'participantes'}
        </p>

        {totalParticipantes > 0 ? (
          <div className="mt-10! grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cantantesDeCategoria.map((cantante) => (
              <ParticipanteCard
                key={cantante.id}
                tipo="CANTANTE"
                id={cantante.id}
                nombre={cantante.nombre}
                fotoUrl={cantante.fotoUrl}
                departamento={cantante.departamento}
              />
            ))}
            {gruposDeCategoria.map((grupo) => (
              <ParticipanteCard
                key={grupo.id}
                tipo="GRUPO"
                id={grupo.id}
                nombre={grupo.nombre}
                fotoUrl={grupo.fotoUrl}
                departamento={grupo.departamento}
                integrantesCount={grupo.integrantes.length}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12! rounded-3xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
            Todavía no hay participantes cargados en esta categoría.
          </div>
        )}
      </div>
    </main>
  );
}

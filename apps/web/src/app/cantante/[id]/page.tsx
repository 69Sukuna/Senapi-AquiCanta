import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DepartamentoBadge } from '@/components/DepartamentoBadge';

interface Cantante {
  id: string;
  nombre: string;
  pseudonimo: string | null;
  tituloTema: string | null;
  autorCompositor: string | null;
  ritmo: string | null;
  tiempo: string | null;
  departamento: string | null;
  fotoUrl: string | null;
  categoria: { id: string; nombre: string };
}

async function getCantante(id: string): Promise<Cantante | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/cantantes/${id}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('No se pudo cargar el cantante');
    return res.json();
  } catch {
    return null;
  }
}

interface CantantePageProps {
  params: Promise<{ id: string }>;
}

// Ficha estilo "cartel": foto circular al centro con un halo de degradado,
// nombre grande debajo, y las tarjetas de datos flanqueándola a los costados
// en desktop (se apilan debajo en mobile).
function StatCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <span className="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#f4c94f]">{label}</span>
      <span className="mt-1.5! block text-base font-bold text-[#fdf6ec]">{value}</span>
    </>
  );

  const classes =
    'w-full rounded-2xl border border-[rgba(224,165,39,0.25)] bg-[rgba(40,10,15,0.55)] p-5! text-center backdrop-blur-md sm:text-left';

  if (href) {
    return (
      <Link href={href} className={`${classes} block! transition-colors duration-200 hover:border-[rgba(224,165,39,0.55)]`}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

// Un dato de la ficha del tema (Ritmo, Tiempo, Autor/Compositor...).
function DatoTema({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#f4c94f]">{label}</span>
      <span className="mt-1! block font-semibold text-[#fdf6ec]">{value}</span>
    </div>
  );
}

export default async function CantantePage({ params }: CantantePageProps) {
  const { id } = await params;
  const cantante = await getCantante(id);

  if (!cantante) {
    notFound();
  }

  const tieneFicha = cantante.tituloTema || cantante.autorCompositor || cantante.ritmo || cantante.tiempo;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(165deg,#3d0a13_0%,#1f0407_55%,#0a0102_100%)]">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#e0a527] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#ff4d5e] opacity-[0.14] blur-3xl" />

      <div className="relative mx-auto! max-w-5xl px-6! py-16! sm:px-10! lg:py-20!">
        <Link
          href="/cantante"
          className="flex! w-fit items-center gap-1.5 text-sm font-semibold text-[#f4c94f]! transition-transform duration-200 hover:translate-x-[-2px] hover:underline!"
        >
          <span aria-hidden="true">←</span> Todos los cantantes
        </Link>

        <div className="mt-12! grid grid-cols-1 items-center gap-6 sm:mt-16! sm:grid-cols-[1fr_auto_1fr] sm:gap-8">
          <div className="order-2 sm:order-1">
            <StatCard label="Categoría" value={cantante.categoria.nombre} href={`/categorias/${cantante.categoria.id}`} />
          </div>

          <div className="order-1 flex flex-col items-center text-center sm:order-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f4c94f] via-[#e11d2e] to-[#7f0f1e] opacity-50 blur-2xl" />
              <div className="relative rounded-full bg-gradient-to-br from-[#f4c94f] via-[#e0a527] to-[#e11d2e] p-1.5">
                <div className="relative h-52 w-52 overflow-hidden rounded-full bg-[#170406] sm:h-64 sm:w-64">
                  {cantante.fotoUrl && (
                    <Image src={cantante.fotoUrl} alt={cantante.nombre} fill sizes="256px" className="object-cover" />
                  )}
                </div>
              </div>
            </div>

            <h1 className="mt-6! text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.2] font-extrabold tracking-tight bg-gradient-to-r from-[#fdf6ec] via-[#f4c94f] to-[#ff4d5e] bg-clip-text text-transparent">
              {cantante.nombre}
            </h1>
            {cantante.pseudonimo && (
              <p className="mt-1! text-[rgba(253,246,236,0.6)]">&quot;{cantante.pseudonimo}&quot;</p>
            )}
            <p className="mt-1.5! text-sm font-semibold uppercase tracking-[0.1em] text-[rgba(253,246,236,0.6)]">
              Cantante solista
            </p>

            {cantante.departamento && (
              <div className="mt-3!">
                <DepartamentoBadge departamento={cantante.departamento} />
              </div>
            )}
          </div>

          <div className="order-3">
            <StatCard label="Edición" value="Aqui Canta Bolivia 2026" />
          </div>
        </div>

        {tieneFicha && (
          <div className="mt-16!">
            <h2 className="text-center text-xl font-bold text-[#fdf6ec] sm:text-left">Tema a interpretar</h2>
            <div className="mt-6! rounded-3xl border border-[rgba(224,165,39,0.18)] bg-[rgba(40,10,15,0.55)] p-6! backdrop-blur-md">
              {cantante.tituloTema && (
                <h3 className="mb-5! text-lg font-bold text-[#f4c94f]">{cantante.tituloTema}</h3>
              )}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                {cantante.autorCompositor && <DatoTema label="Autor / Compositor" value={cantante.autorCompositor} />}
                {cantante.ritmo && <DatoTema label="Ritmo" value={cantante.ritmo} />}
                {cantante.tiempo && <DatoTema label="Tiempo" value={`${cantante.tiempo} min`} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

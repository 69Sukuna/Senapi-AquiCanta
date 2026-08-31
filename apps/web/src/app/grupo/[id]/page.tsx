import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DepartamentoBadge } from '@/components/DepartamentoBadge';

interface Integrante {
  id: string;
  nombre: string;
  nombreReferencia: string | null;
  instrumento: string | null;
  fotoUrl: string | null;
}

interface Grupo {
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
  integrantes: Integrante[];
}

async function getGrupo(id: string): Promise<Grupo | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/grupos/${id}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('No se pudo cargar el grupo');
    return res.json();
  } catch {
    return null;
  }
}

interface GrupoPageProps {
  params: Promise<{ id: string }>;
}

// Misma ficha "cartel" que cantante/[id]/page.tsx (foto al centro, nombre
// debajo, datos flanqueando), más una sección de integrantes abajo.
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

function IntegranteCard({ integrante }: { integrante: Integrante }) {
  return (
    <div className="flex w-36 flex-col items-center gap-3 rounded-2xl border border-[rgba(224,165,39,0.18)] bg-[rgba(40,10,15,0.55)] p-5! text-center backdrop-blur-md sm:w-40">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[rgba(224,165,39,0.3)] bg-[rgba(0,0,0,0.3)]">
        {integrante.fotoUrl && (
          <Image src={integrante.fotoUrl} alt={integrante.nombre} fill sizes="80px" className="object-cover" />
        )}
      </div>

      <div>
        <p className="font-bold text-[#fdf6ec]">{integrante.nombre}</p>
        {integrante.nombreReferencia && (
          <p className="mt-0.5! text-sm text-[rgba(253,246,236,0.55)]">&quot;{integrante.nombreReferencia}&quot;</p>
        )}
      </div>

      {integrante.instrumento && (
        <span className="inline-flex! rounded-full border border-[rgba(224,165,39,0.35)] bg-[rgba(224,165,39,0.1)] px-2.5! py-0.5! text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#f4c94f]">
          {integrante.instrumento}
        </span>
      )}
    </div>
  );
}

export default async function GrupoPage({ params }: GrupoPageProps) {
  const { id } = await params;
  const grupo = await getGrupo(id);

  if (!grupo) {
    notFound();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(165deg,#3d0a13_0%,#1f0407_55%,#0a0102_100%)]">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#e0a527] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#ff4d5e] opacity-[0.14] blur-3xl" />

      <div className="relative mx-auto! max-w-5xl px-6! py-16! sm:px-10! lg:py-20!">
        <Link
          href="/grupo"
          className="flex! w-fit items-center gap-1.5 text-sm font-semibold text-[#f4c94f]! transition-transform duration-200 hover:translate-x-[-2px] hover:underline!"
        >
          <span aria-hidden="true">←</span> Todos los grupos
        </Link>

        <div className="mt-12! grid grid-cols-1 items-center gap-6 sm:mt-16! sm:grid-cols-[1fr_auto_1fr] sm:gap-8">
          <div className="order-2 sm:order-1">
            <StatCard label="Categoría" value={grupo.categoria.nombre} href={`/categorias/${grupo.categoria.id}`} />
          </div>

          <div className="order-1 flex flex-col items-center text-center sm:order-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f4c94f] via-[#e11d2e] to-[#7f0f1e] opacity-50 blur-2xl" />
              <div className="relative rounded-full bg-gradient-to-br from-[#f4c94f] via-[#e0a527] to-[#e11d2e] p-1.5">
                <div className="relative h-52 w-52 overflow-hidden rounded-full bg-[#170406] sm:h-64 sm:w-64">
                  {grupo.fotoUrl && (
                    <Image src={grupo.fotoUrl} alt={grupo.nombre} fill sizes="256px" className="object-cover" />
                  )}
                </div>
              </div>
            </div>

            <h1 className="mt-6! text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.2] font-extrabold tracking-tight bg-gradient-to-r from-[#fdf6ec] via-[#f4c94f] to-[#ff4d5e] bg-clip-text text-transparent">
              {grupo.nombre}
            </h1>
            {grupo.pseudonimo && (
              <p className="mt-1! text-[rgba(253,246,236,0.6)]">&quot;{grupo.pseudonimo}&quot;</p>
            )}
            <p className="mt-1.5! text-sm font-semibold uppercase tracking-[0.1em] text-[rgba(253,246,236,0.6)]">
              Grupo · {grupo.integrantes.length} {grupo.integrantes.length === 1 ? 'integrante' : 'integrantes'}
            </p>

            {grupo.departamento && (
              <div className="mt-3!">
                <DepartamentoBadge departamento={grupo.departamento} />
              </div>
            )}
          </div>

          <div className="order-3">
            <StatCard label="Edición" value="Aqui Canta Bolivia 2026" />
          </div>
        </div>

        {(grupo.tituloTema || grupo.autorCompositor || grupo.ritmo || grupo.tiempo) && (
          <div className="mt-16!">
            <h2 className="text-center text-xl font-bold text-[#fdf6ec] sm:text-left">Tema a interpretar</h2>
            <div className="mt-6! rounded-3xl border border-[rgba(224,165,39,0.18)] bg-[rgba(40,10,15,0.55)] p-6! backdrop-blur-md">
              {grupo.tituloTema && <h3 className="mb-5! text-lg font-bold text-[#f4c94f]">{grupo.tituloTema}</h3>}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                {grupo.autorCompositor && <DatoTema label="Autor / Compositor" value={grupo.autorCompositor} />}
                {grupo.ritmo && <DatoTema label="Ritmo" value={grupo.ritmo} />}
                {grupo.tiempo && <DatoTema label="Tiempo" value={`${grupo.tiempo} min`} />}
              </div>
            </div>
          </div>
        )}

        {grupo.integrantes.length > 0 && (
          <div className="mt-16!">
            <h2 className="text-center text-xl font-bold text-[#fdf6ec] sm:text-left">Integrantes</h2>
            <div className="mt-6! flex flex-wrap justify-center gap-4">
              {grupo.integrantes.map((integrante) => (
                <IntegranteCard key={integrante.id} integrante={integrante} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

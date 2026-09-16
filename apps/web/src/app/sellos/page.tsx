import { PasaportePage } from './_components/PasaportePage';
import { SellosHero } from './_components/SellosHero';
import { ProximoEventoBanner } from './_components/ProximoEventoBanner';

interface Trayecto {
  id: string;
  nombre: string;
  descripcion: string | null;
}

async function getTrayectos(): Promise<Trayecto[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/sellos/trayectos`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function SellosPage() {
  // Ordenados del más reciente al más viejo (ver `listarTrayectos` en la
  // API) — se muestran TODOS los trayectos activos, no solo uno.
  const trayectos = await getTrayectos();

  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg-primary)">
      {/* En mobile se va directo al banner "Próximos Sellos" — el Hero
          decorativo es contenido de escritorio. */}
      <div className="hidden md:block">
        <SellosHero />
      </div>
      {trayectos.length > 0 && <ProximoEventoBanner />}

      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#f0a83e] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-(--brand-cafe) opacity-[0.1] blur-3xl" />

      <div className="relative mx-auto! max-w-5xl px-6! py-16! sm:px-10! lg:py-20!">
        {trayectos.length > 0 ? (
          <PasaportePage trayectos={trayectos} />
        ) : (
          <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
            No hay ningún recorrido de sellos activo en este momento.
          </div>
        )}
      </div>
    </main>
  );
}

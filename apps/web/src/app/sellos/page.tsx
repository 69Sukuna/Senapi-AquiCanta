import { PasaportePage } from './_components/PasaportePage';

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
  const trayectos = await getTrayectos();
  // Por ahora se muestra un único trayecto activo; el modelo ya soporta
  // varios en paralelo para cuando haya más de un evento a la vez.
  const trayecto = trayectos[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg-primary)">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#f0a83e] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#1e63b8] opacity-[0.1] blur-3xl" />

      <div className="relative mx-auto! max-w-5xl px-6! py-16! sm:px-10! lg:py-20!">
        <span className="badge badge-gold inline-flex! w-fit">
          <span className="pulse-dot" />
          Aqui Canta Bolivia
        </span>

        <h1 className="mt-2! text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.5] font-extrabold tracking-tight text-(--text-primary)">
          Sellos
        </h1>
        <p className="mt-2! max-w-2xl text-base text-(--text-secondary) sm:text-lg">
          {trayecto?.descripcion ?? 'Escanea los puntos del festival y arma tu pasaporte de sellos.'}
        </p>

        {trayecto ? (
          <PasaportePage trayectoId={trayecto.id} />
        ) : (
          <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
            No hay ningún recorrido de sellos activo en este momento.
          </div>
        )}
      </div>
    </main>
  );
}

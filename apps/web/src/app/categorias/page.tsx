import { CategoriaCard } from "./_components/CategoriaCard";

interface Categoria {
  id: string;
  nombre: string;
}

async function getCategorias(): Promise<Categoria[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  try {
    const res = await fetch(`${apiUrl}/categorias`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CategoriasPage() {
  const categorias = await getCategorias();

  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg-primary)">
      {/* Blobs decorativos — puramente visuales, no afectan el layout */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#f0a83e] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#1e63b8] opacity-[0.1] blur-3xl" />

      <div className="relative mx-auto! max-w-7xl px-6! py-16! sm:px-10! lg:py-20!">
        <span className="badge badge-gold inline-flex! w-fit">
          <span className="pulse-dot" />
          Aqui Canta Bolivia
        </span>

        <h1 className="mt-2! text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.5] font-extrabold tracking-tight text-(--text-primary)">
          Categorías del concurso
        </h1>
        <p className="mt-2! max-w-2xl text-base text-(--text-secondary) sm:text-lg">
          Elige una categoría para ver a los participantes inscritos.
        </p>

        {categorias.length > 0 ? (
          <div className="mt-12! grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categorias.map((categoria) => (
              <CategoriaCard
                key={categoria.id}
                id={categoria.id}
                nombre={categoria.nombre}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
            No pudimos cargar las categorías en este momento.
          </div>
        )}
      </div>
    </main>
  );
}

import Link from 'next/link';

export default function CategoriaNotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--bg-primary)">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#f0a83e] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#1e63b8] opacity-[0.1] blur-3xl" />

      <div className="relative mx-auto! max-w-lg px-6! py-16! text-center">
        <span className="badge badge-gold inline-flex! w-fit">
          Error 404
        </span>

        <h1 className="mt-5! text-[clamp(2rem,4.5vw,3rem)] leading-[1.2] font-extrabold tracking-tight text-(--text-primary)">
          Categoría no encontrada
        </h1>
        <p className="mt-4! text-(--text-secondary)">
          La categoría que buscas no existe o fue eliminada.
        </p>

        <Link
          href="/categorias"
          className="mt-8! inline-flex! items-center gap-2 rounded-full bg-[#1e63b8] px-6! py-2.5! text-sm font-bold text-white! transition-transform duration-200 hover:-translate-y-0.5"
        >
          ← Ver todas las categorías
        </Link>
      </div>
    </main>
  );
}

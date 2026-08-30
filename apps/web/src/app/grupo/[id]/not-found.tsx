import Link from 'next/link';

export default function GrupoNotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(165deg,#3d0a13_0%,#1f0407_55%,#0a0102_100%)]">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#e0a527] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#ff4d5e] opacity-[0.14] blur-3xl" />

      <div className="relative mx-auto! max-w-lg px-6! py-16! text-center">
        <span className="inline-flex! items-center gap-2 rounded-full border border-[rgba(224,165,39,0.4)] bg-[rgba(224,165,39,0.1)] px-4! py-1.5! text-xs font-bold uppercase tracking-[0.14em] text-[#f4c94f]">
          Error 404
        </span>

        <h1 className="mt-5! text-[clamp(2rem,4.5vw,3rem)] leading-[1.2] font-extrabold tracking-tight bg-gradient-to-r from-[#fdf6ec] via-[#f4c94f] to-[#ff4d5e] bg-clip-text text-transparent">
          Grupo no encontrado
        </h1>
        <p className="mt-4! text-[rgba(253,246,236,0.7)]">
          El grupo que buscas no existe o fue eliminado.
        </p>

        <Link
          href="/grupo"
          className="mt-8! inline-flex! items-center gap-2 rounded-full bg-gradient-to-r from-[#f4c94f] to-[#e0a527] px-6! py-2.5! text-sm font-bold text-[#170406]! transition-transform duration-200 hover:-translate-y-0.5"
        >
          ← Ver todos los grupos
        </Link>
      </div>
    </main>
  );
}

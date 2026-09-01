interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

// Cabecera (badge + título en degradado + descripción) tal como aparece en
// /categorias y /grupo — extraída para reusarla en el resto de rutas.
export function PageHero({ eyebrow = 'Aqui Canta Bolivia', title, description }: PageHeroProps) {
  return (
    <>
      <span className="inline-flex! items-center gap-2 rounded-full border border-[rgba(224,165,39,0.4)] bg-[rgba(224,165,39,0.1)] px-4! py-1.5! text-xs font-bold uppercase tracking-[0.14em] text-[#f4c94f]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f4c94f]" />
        {eyebrow}
      </span>

      <h1 className="mt-2! text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.5] font-extrabold tracking-tight bg-gradient-to-r from-[#fdf6ec] via-[#f4c94f] to-[#ff4d5e] bg-clip-text text-transparent">
        {title}
      </h1>

      {description && (
        <p className="mt-2! max-w-2xl text-base text-[rgba(253,246,236,0.74)] sm:text-lg">{description}</p>
      )}
    </>
  );
}

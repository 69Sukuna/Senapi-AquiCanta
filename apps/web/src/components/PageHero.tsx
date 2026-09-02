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
      <span className="badge badge-gold inline-flex! w-fit">
        <span className="pulse-dot" />
        {eyebrow}
      </span>

      <h1 className="mt-2! text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.5] font-extrabold tracking-tight text-(--text-primary)">
        {title}
      </h1>

      {description && (
        <p className="mt-2! max-w-2xl text-base text-(--text-secondary) sm:text-lg">{description}</p>
      )}
    </>
  );
}

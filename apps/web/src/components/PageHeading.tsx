interface PageHeadingProps {
  title: string;
}

// Placeholder usado en cada página mientras no tiene contenido real todavía:
// solo indica en qué página estás.
export function PageHeading({ title }: PageHeadingProps) {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Página {title}</h1>
    </div>
  );
}

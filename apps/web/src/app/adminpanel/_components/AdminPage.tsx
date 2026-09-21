interface AdminPageProps {
  title: string;
  description?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

// Contenedor + cabecera compacta común de todas las pantallas del panel.
// Reemplaza a PageShell/PageHero (pensados para páginas públicas: badge,
// título gigante, blobs de fondo, ~5rem de padding vertical) que le comían
// mucho espacio a las tablas y formularios de admin.
export function AdminPage({ title, description, maxWidth = 'max-w-7xl', children }: AdminPageProps) {
  return (
    <main className={`mx-auto min-h-[70vh] w-full ${maxWidth} px-4! py-6! sm:px-6!`}>
      <header className="pb-5!">
        <h1 className="text-xl font-extrabold tracking-tight text-(--text-primary) sm:text-2xl">{title}</h1>
        {description && <p className="mt-0.5! text-sm text-(--text-secondary)">{description}</p>}
      </header>

      {children}
    </main>
  );
}

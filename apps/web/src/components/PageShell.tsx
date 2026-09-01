interface PageShellProps {
  children: React.ReactNode;
  maxWidth?: string;
}

// Fondo full-bleed + blobs decorativos compartidos por las páginas "explorer"
// (categorías, grupo, cantante...). Centraliza ese patrón para reusarlo en el
// resto de rutas sin repetir las mismas clases en cada page.tsx.
export function PageShell({ children, maxWidth = 'max-w-7xl' }: PageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(165deg,#3d0a13_0%,#1f0407_55%,#0a0102_100%)]">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#e0a527] opacity-[0.14] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#ff4d5e] opacity-[0.14] blur-3xl" />

      <div className={`relative mx-auto! ${maxWidth} px-6! py-16! sm:px-10! lg:py-20!`}>{children}</div>
    </main>
  );
}

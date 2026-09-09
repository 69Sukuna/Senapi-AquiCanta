import { PageHero } from './PageHero';
import { PageShell } from './PageShell';

interface VistaCerradaProps {
  nombre: string;
  descripcion?: string | null;
}

// Se muestra en vez del contenido normal de una vista cuando el admin la
// desactivó desde /adminpanel/vistas (ver lib/vistas.ts).
export function VistaCerrada({ nombre, descripcion }: VistaCerradaProps) {
  return (
    <PageShell maxWidth="max-w-2xl">
      <PageHero
        title={nombre}
        description="Esta sección no está disponible por el momento."
      />
      <div className="mt-8! rounded-2xl border border-dashed border-(--border) p-10! text-center">
        <p className="text-lg font-bold text-(--text-primary)">Cerrado temporalmente</p>
        <p className="mt-2! text-(--text-secondary)">
          {descripcion ?? 'Vuelve a intentarlo más adelante.'}
        </p>
      </div>
    </PageShell>
  );
}

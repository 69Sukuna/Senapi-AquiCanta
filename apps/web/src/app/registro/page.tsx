import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function RegistroPage() {
  return (
    <PageShell maxWidth="max-w-md">
      <PageHero title="Crear cuenta" description="Regístrate para participar en Aqui Canta Bolivia." />

      <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}

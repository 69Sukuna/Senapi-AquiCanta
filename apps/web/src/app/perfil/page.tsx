import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function PerfilPage() {
  return (
    <PageShell maxWidth="max-w-3xl">
      <PageHero title="Mi perfil" description="Gestiona tus datos e inscripciones." />

      <div className="mt-12! rounded-2xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}

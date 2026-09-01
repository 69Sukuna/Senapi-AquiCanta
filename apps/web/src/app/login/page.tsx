import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function LoginPage() {
  return (
    <PageShell maxWidth="max-w-md">
      <PageHero title="Iniciar sesión" description="Accede a tu cuenta de Aqui Canta Bolivia." />

      <div className="mt-12! rounded-2xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}

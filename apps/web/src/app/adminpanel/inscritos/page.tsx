import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';
import { InscritosExplorer } from './_components/InscritosExplorer';

// El fetch se hace en InscritosExplorer (cliente), no acá: la lista es un
// endpoint admin protegido por JwtAuthGuard y el token vive en localStorage,
// al que un componente servidor no tiene acceso (ver lib/auth.ts).
export default function AdminInscritosPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Panel Admin"
        title="Inscritos"
        description="Revisa, filtra y gestiona las postulaciones recibidas — cantantes y grupos."
      />

      <InscritosExplorer />
    </PageShell>
  );
}

import { AdminPage } from '../_components/AdminPage';
import { InscritosExplorer } from './_components/InscritosExplorer';

// El fetch se hace en InscritosExplorer (cliente), no acá: la lista es un
// endpoint admin protegido por JwtAuthGuard y el token vive en localStorage,
// al que un componente servidor no tiene acceso (ver lib/auth.ts).
export default function AdminInscritosPage() {
  return (
    <AdminPage title="Inscritos" description="Revisa, filtra y gestiona las postulaciones — cantantes y grupos.">
      <InscritosExplorer />
    </AdminPage>
  );
}

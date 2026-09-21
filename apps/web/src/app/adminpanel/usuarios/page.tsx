import { AdminPage } from '../_components/AdminPage';
import { UsuariosExplorer } from './_components/UsuariosExplorer';

// El fetch se hace en UsuariosExplorer (cliente): el endpoint es solo ADMIN y
// el token vive en localStorage (ver lib/auth.ts).
export default function AdminUsuariosPage() {
  return (
    <AdminPage
      title="Usuarios"
      description="Cuentas de acceso al panel: administradores y usuarios de departamento."
    >
      <UsuariosExplorer />
    </AdminPage>
  );
}

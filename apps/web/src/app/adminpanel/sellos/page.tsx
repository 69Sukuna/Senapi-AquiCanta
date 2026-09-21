import { AdminPage } from '../_components/AdminPage';
import { SellosAdminExplorer } from './_components/SellosAdminExplorer';

export default function AdminSellosPage() {
  return (
    <AdminPage title="Sellos" description="Trayectos, eventos, puntos de escaneo, rangos y medallas.">
      <SellosAdminExplorer />
    </AdminPage>
  );
}

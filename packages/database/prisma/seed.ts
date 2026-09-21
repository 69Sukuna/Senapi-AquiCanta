import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Este seed corre en cada deploy — a propósito NO crea categorías,
// cantantes/grupos de ejemplo, trayectos de prueba, medallas ni vistas: eso
// era data de ejemplo pensada solo para desarrollo local, pero al correr
// también en producción terminaba mezclándose con los datos reales que ya
// se cargan a mano desde el panel admin (y con `upsert` corría el riesgo de
// pisar configuración real ya editada). Lo único que debe existir siempre,
// en cualquier entorno, es el usuario admin.
async function main() {
  // Usuario admin del panel — solo se crea si NO hay ningún admin en la base
  // (nunca pisa un password ya cambiado). Se revisa por rol y no por el
  // email de ADMIN_EMAIL a propósito: el admin puede cambiar su propio
  // email/usuario desde el panel (pestaña Usuarios), y buscando por email
  // este seed —que corre en cada arranque— crearía un segundo admin con la
  // contraseña de las variables de entorno. Credenciales desde .env; ver
  // .env.example para los nombres de variable esperados.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD no están en .env — no se creó ningún usuario admin.');
    return;
  }

  const cantidadAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (cantidadAdmins > 0) {
    console.log(`Ya existe ${cantidadAdmins} usuario(s) admin, no se crea otro.`);
    return;
  }

  const emailOcupado = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (emailOcupado) {
    console.warn(`No hay ningún admin, pero "${adminEmail}" ya existe con otro rol — no se creó el admin. Ajusta el rol a mano.`);
    return;
  }

  const passwordHasheado = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({
    data: {
      email: adminEmail,
      username: adminUsername || null,
      password: passwordHasheado,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });
  console.log(`Seed listo: usuario admin "${adminEmail}" creado.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

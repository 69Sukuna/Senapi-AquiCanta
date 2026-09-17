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
  // Usuario admin del panel — solo se crea si no existe todavía (nunca pisa
  // un password ya cambiado por el admin). Credenciales desde .env; ver
  // .env.example para los nombres de variable esperados.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD no están en .env — no se creó ningún usuario admin.');
    return;
  }

  const adminExistente = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (adminExistente) {
    console.log(`Usuario admin "${adminEmail}" ya existe, no se vuelve a crear.`);
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

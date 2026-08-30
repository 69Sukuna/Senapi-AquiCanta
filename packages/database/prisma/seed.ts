import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIAS_BASE = [
  'Ñusta',
  'Solista vocal',
  'Solista instrumental – Armónico',
  'Solista instrumental – Melódico',
  'Dúo vocal instrumental',
  'Trio vocal instrumental',
  'Grupo vocal instrumental',
  'Estudiantina',
  'Autóctono',
  'Composición',
  'Solista vocal infantil',
  'Solista instrumental infantil',
  'Especial',
];

const CANTANTES_BASE = [
  { nombre: 'María Fernanda Choque', categoria: 'Solista vocal' },
  { nombre: 'Sebastián Rojas', categoria: 'Solista vocal' },
  { nombre: 'Ana Lucía Mamani', categoria: 'Solista vocal infantil' },
  { nombre: 'Javier Quispe', categoria: 'Solista instrumental – Armónico' },
  { nombre: 'Camila Fernández', categoria: 'Ñusta' },
];

const GRUPOS_BASE = [
  {
    nombre: 'Los Hermanos del Valle',
    categoria: 'Trio vocal instrumental',
    integrantes: [
      { nombre: 'Marco Antonio Vargas', nombreReferencia: 'El Charango', instrumento: 'Charango' },
      { nombre: 'Luis Alberto Condori', nombreReferencia: null, instrumento: 'Guitarra' },
      { nombre: 'Ronald Apaza', nombreReferencia: 'Ronny', instrumento: 'Voz' },
    ],
  },
  {
    nombre: 'Estudiantina Oruro',
    categoria: 'Estudiantina',
    integrantes: [
      { nombre: 'Patricia Flores', nombreReferencia: null, instrumento: 'Mandolina' },
      { nombre: 'Jorge Luis Mamani', nombreReferencia: null, instrumento: 'Bombo' },
      { nombre: 'Elena Ticona', nombreReferencia: 'La Nena', instrumento: 'Voz' },
      { nombre: 'Daniel Choquehuanca', nombreReferencia: null, instrumento: 'Zampoña' },
    ],
  },
  {
    nombre: 'Dúo Kantuta',
    categoria: 'Dúo vocal instrumental',
    integrantes: [
      { nombre: 'Rosa Yujra', nombreReferencia: null, instrumento: 'Voz' },
      { nombre: 'Pedro Callisaya', nombreReferencia: null, instrumento: 'Guitarra' },
    ],
  },
];

function fotoPlaceholder(nombre: string, colorFondo: string) {
  // Sin foto real todavía: avatar de iniciales en vez de caras random de
  // stock, para no romper el tono del sitio.
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=${colorFondo}&color=170406&size=400&bold=true`;
}

async function main() {
  const categoriasPorNombre = new Map<string, string>();

  for (const nombre of CATEGORIAS_BASE) {
    const categoria = await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    categoriasPorNombre.set(nombre, categoria.id);
  }

  console.log(`Seed listo: ${CATEGORIAS_BASE.length} categorías aseguradas en la base.`);

  // Los cantantes no tienen una clave natural única (dos personas pueden
  // compartir nombre), así que solo se siembran si la tabla está vacía —
  // evita duplicar filas cada vez que se corre el seed en desarrollo.
  const cantantesExistentes = await prisma.cantante.count();
  if (cantantesExistentes === 0) {
    for (const { nombre, categoria } of CANTANTES_BASE) {
      const categoriaId = categoriasPorNombre.get(categoria);
      if (!categoriaId) continue;

      await prisma.cantante.create({
        data: {
          nombre,
          categoriaId,
          fotoUrl: fotoPlaceholder(nombre, 'e0a527'),
        },
      });
    }
    console.log(`Seed listo: ${CANTANTES_BASE.length} cantantes de ejemplo creados.`);
  } else {
    console.log(`Cantantes ya existentes (${cantantesExistentes}), no se vuelve a sembrar.`);
  }

  // Mismo criterio que cantantes: sin clave natural única, solo se siembra
  // si la tabla está vacía.
  const gruposExistentes = await prisma.grupo.count();
  if (gruposExistentes === 0) {
    for (const { nombre, categoria, integrantes } of GRUPOS_BASE) {
      const categoriaId = categoriasPorNombre.get(categoria);
      if (!categoriaId) continue;

      await prisma.grupo.create({
        data: {
          nombre,
          categoriaId,
          fotoUrl: fotoPlaceholder(nombre, '7f0f1e'),
          integrantes: {
            create: integrantes.map((integrante) => ({
              ...integrante,
              fotoUrl: fotoPlaceholder(integrante.nombreReferencia || integrante.nombre, 'e0a527'),
            })),
          },
        },
      });
    }
    console.log(`Seed listo: ${GRUPOS_BASE.length} grupos de ejemplo creados.`);
  } else {
    console.log(`Grupos ya existentes (${gruposExistentes}), no se vuelve a sembrar.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

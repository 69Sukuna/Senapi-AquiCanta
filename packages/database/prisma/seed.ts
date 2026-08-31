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

// Campos según el Anexo 1 (Ficha de Postulación) de la convocatoria.
const CANTANTES_BASE = [
  {
    nombre: 'María Fernanda Choque',
    categoria: 'Solista vocal',
    departamento: 'LA_PAZ' as const,
    tituloTema: 'Llorando se fue',
    autorCompositor: 'Ulises Hermosa',
    ritmo: 'Huayño',
    tiempo: '3:45',
  },
  {
    nombre: 'Sebastián Rojas',
    categoria: 'Solista vocal',
    departamento: 'COCHABAMBA' as const,
    tituloTema: 'Cholita paceña',
    autorCompositor: 'Sebastián Rojas',
    ritmo: 'Cueca',
    tiempo: '4:10',
  },
  {
    nombre: 'Ana Lucía Mamani',
    categoria: 'Solista vocal infantil',
    departamento: 'ORURO' as const,
    tituloTema: 'Cóndor de los Andes',
    autorCompositor: 'Trad.',
    ritmo: 'Morenada',
    tiempo: '3:00',
  },
  {
    nombre: 'Javier Quispe',
    categoria: 'Solista instrumental – Armónico',
    departamento: 'POTOSI' as const,
    tituloTema: 'Vuelo de cóndor',
    autorCompositor: 'Trad.',
    ritmo: 'Sicuriada',
    tiempo: '5:00',
  },
  {
    nombre: 'Camila Fernández',
    categoria: 'Ñusta',
    departamento: 'SANTA_CRUZ' as const,
    tituloTema: 'Flor de camba',
    autorCompositor: 'Camila Fernández',
    ritmo: 'Taquirari',
    tiempo: '3:30',
  },
  {
    nombre: 'Roberto Salinas',
    categoria: 'Composición',
    departamento: 'CHUQUISACA' as const,
    pseudonimo: 'El Poeta del Altiplano',
    tituloTema: 'Canto a mi tierra',
    autorCompositor: 'Roberto Salinas',
    ritmo: 'Bailecito',
    tiempo: '3:20',
  },
];

const GRUPOS_BASE = [
  {
    nombre: 'Los Hermanos del Valle',
    categoria: 'Trio vocal instrumental',
    departamento: 'TARIJA' as const,
    tituloTema: 'Chapaco de corazón',
    autorCompositor: 'Los Hermanos del Valle',
    ritmo: 'Rueda chapaca',
    tiempo: '4:00',
    integrantes: [
      { nombre: 'Marco Antonio Vargas', nombreReferencia: 'El Charango', instrumento: 'Charango' },
      { nombre: 'Luis Alberto Condori', nombreReferencia: null, instrumento: 'Guitarra' },
      { nombre: 'Ronald Apaza', nombreReferencia: 'Ronny', instrumento: 'Voz' },
    ],
  },
  {
    nombre: 'Estudiantina Oruro',
    categoria: 'Estudiantina',
    departamento: 'ORURO' as const,
    tituloTema: 'Diablada eterna',
    autorCompositor: 'Trad.',
    ritmo: 'Diablada',
    tiempo: '5:30',
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
    departamento: 'BENI' as const,
    tituloTema: 'Río de mi Beni',
    autorCompositor: 'Dúo Kantuta',
    ritmo: 'Taquirari',
    tiempo: '3:50',
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
    for (const { categoria, ...datos } of CANTANTES_BASE) {
      const categoriaId = categoriasPorNombre.get(categoria);
      if (!categoriaId) continue;

      await prisma.cantante.create({
        data: {
          ...datos,
          categoriaId,
          fotoUrl: fotoPlaceholder(datos.nombre, 'e0a527'),
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
    for (const { categoria, integrantes, ...datos } of GRUPOS_BASE) {
      const categoriaId = categoriasPorNombre.get(categoria);
      if (!categoriaId) continue;

      await prisma.grupo.create({
        data: {
          ...datos,
          categoriaId,
          fotoUrl: fotoPlaceholder(datos.nombre, '7f0f1e'),
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

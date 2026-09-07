import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Límites según la convocatoria oficial (CONVOCATORIA AQUI CANTA BOLIVIA, 26
// AGOSTO 2026). Igual a GRUPOS_CATEGORIAS en apps/web/src/lib/categorias.ts —
// integrantesMax > 1 determina si la postulación crea un Grupo o un Cantante.
// acompanantesMax es el máximo de músicos de acompañamiento (solo aplica a
// categorías individuales). edadMinima/edadMaxima, en años al 10-sep-2026.
const CATEGORIAS_BASE = [
  {
    nombre: 'Ñusta',
    integrantesMin: 1,
    integrantesMax: 1,
    acompanantesMax: 0,
    edadMinima: 16,
    edadMaxima: 25,
    duracionMaximaMinutos: 10,
  },
  {
    nombre: 'Solista vocal',
    integrantesMin: 1,
    integrantesMax: 1,
    acompanantesMax: 5,
    edadMinima: null,
    edadMaxima: null,
    duracionMaximaMinutos: 5,
  },
  {
    nombre: 'Solista instrumental – Armónico',
    integrantesMin: 1,
    integrantesMax: 1,
    acompanantesMax: 1,
    edadMinima: null,
    edadMaxima: null,
    duracionMaximaMinutos: 5,
  },
  {
    nombre: 'Solista instrumental – Melódico',
    integrantesMin: 1,
    integrantesMax: 1,
    acompanantesMax: 1,
    edadMinima: null,
    edadMaxima: null,
    duracionMaximaMinutos: 5,
  },
  {
    nombre: 'Dúo vocal instrumental',
    integrantesMin: 2,
    integrantesMax: 2,
    acompanantesMax: 0,
    edadMinima: null,
    edadMaxima: null,
    duracionMaximaMinutos: 5,
  },
  {
    nombre: 'Trío vocal instrumental',
    integrantesMin: 3,
    integrantesMax: 3,
    acompanantesMax: 0,
    edadMinima: null,
    edadMaxima: null,
    duracionMaximaMinutos: 5,
  },
  {
    nombre: 'Grupo vocal instrumental',
    integrantesMin: 4,
    integrantesMax: 8,
    acompanantesMax: 0,
    edadMinima: null,
    edadMaxima: null,
    duracionMaximaMinutos: 5,
  },
  {
    nombre: 'Estudiantina',
    integrantesMin: 8,
    integrantesMax: 15,
    acompanantesMax: 0,
    edadMinima: null,
    edadMaxima: null,
    duracionMaximaMinutos: 7,
  },
  {
    nombre: 'Autóctono',
    integrantesMin: 8,
    integrantesMax: 20,
    acompanantesMax: 0,
    edadMinima: null,
    edadMaxima: null,
    duracionMaximaMinutos: 7,
  },
  {
    nombre: 'Composición',
    integrantesMin: 1,
    integrantesMax: 1,
    acompanantesMax: 5,
    edadMinima: null,
    edadMaxima: null,
    duracionMaximaMinutos: 5,
  },
  {
    nombre: 'Solista vocal infantil',
    integrantesMin: 1,
    integrantesMax: 1,
    acompanantesMax: 5,
    edadMinima: null,
    edadMaxima: 12,
    duracionMaximaMinutos: 5,
    requiereAdultoResponsable: true,
  },
  {
    nombre: 'Solista instrumental infantil',
    integrantesMin: 1,
    integrantesMax: 1,
    acompanantesMax: 1,
    edadMinima: null,
    edadMaxima: 12,
    duracionMaximaMinutos: 5,
    requiereAdultoResponsable: true,
  },
  // 10 integrantes + 1 encargado de sonido opcional (no modelado aparte: se
  // registra como un integrante más, distinguible por su instrumento).
  {
    nombre: 'Especial',
    integrantesMin: 1,
    integrantesMax: 11,
    acompanantesMax: 0,
    edadMinima: null,
    edadMaxima: null,
    duracionMaximaMinutos: 5,
  },
];

// Fotos de ejemplo: retratos reales de personas (Wikimedia Commons, CC),
// elegidos por afinidad de género/edad/ritmo con cada ejemplo — no son fotos
// de los propios postulantes ficticios, sino un "standin" fotográfico para
// que el catálogo no se vea con avatares de iniciales. Se sirven como
// archivos locales en apps/web/public/images/participantes/ (en vez de
// hotlinkear a Wikimedia) porque su CDN aplica rate-limit agresivo a fetches
// repetidos como los del optimizador de imágenes de Next.js.

// Campos según el Anexo 1 (Ficha de Postulación) de la convocatoria. El
// videoUrl de cada ejemplo es un video real de YouTube: para "Llorando se
// fue" es la interpretación original de Los Kjarkas (autor: Ulises Hermosa);
// para el resto de ejemplos, cuyo autor/compositor es ficticio, se usó un
// video real representativo del mismo ritmo folklórico.
const CANTANTES_BASE = [
  {
    nombre: 'María Fernanda Choque',
    categoria: 'Solista vocal',
    departamento: 'LA_PAZ' as const,
    tituloTema: 'Llorando se fue',
    autorCompositor: 'Ulises Hermosa',
    ritmo: 'Huayño',
    tiempo: '3:45',
    fotoUrl: '/images/participantes/maria-fernanda-choque.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=q8SQpgtIsBE',
  },
  {
    nombre: 'Sebastián Rojas',
    categoria: 'Solista vocal',
    departamento: 'COCHABAMBA' as const,
    tituloTema: 'Cholita paceña',
    autorCompositor: 'Sebastián Rojas',
    ritmo: 'Cueca',
    tiempo: '4:10',
    fotoUrl: '/images/participantes/sebastian-rojas.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=Opzivoyb8hQ',
  },
  {
    nombre: 'Ana Lucía Mamani',
    categoria: 'Solista vocal infantil',
    departamento: 'ORURO' as const,
    tituloTema: 'Cóndor de los Andes',
    autorCompositor: 'Trad.',
    ritmo: 'Morenada',
    tiempo: '3:00',
    fotoUrl: '/images/participantes/ana-lucia-mamani.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=gEh8W1L4cog',
  },
  {
    nombre: 'Javier Quispe',
    categoria: 'Solista instrumental – Armónico',
    departamento: 'POTOSI' as const,
    tituloTema: 'Vuelo de cóndor',
    autorCompositor: 'Trad.',
    ritmo: 'Sicuriada',
    tiempo: '5:00',
    fotoUrl: '/images/participantes/javier-quispe.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=VQPUJdOmcuM',
  },
  {
    nombre: 'Camila Fernández',
    categoria: 'Ñusta',
    departamento: 'SANTA_CRUZ' as const,
    tituloTema: 'Flor de camba',
    autorCompositor: 'Camila Fernández',
    ritmo: 'Taquirari',
    tiempo: '3:30',
    fotoUrl: '/images/participantes/camila-fernandez.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=L2O2Jrqyljg',
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
    fotoUrl: '/images/participantes/roberto-salinas.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=NDDFLIPgThE',
  },
];

const GRUPOS_BASE = [
  {
    nombre: 'Los Hermanos del Valle',
    categoria: 'Trío vocal instrumental',
    departamento: 'TARIJA' as const,
    tituloTema: 'Chapaco de corazón',
    autorCompositor: 'Los Hermanos del Valle',
    ritmo: 'Rueda chapaca',
    tiempo: '4:00',
    fotoUrl: '/images/participantes/los-hermanos-del-valle.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=fXWsCjf2EQ4',
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
    fotoUrl: '/images/participantes/estudiantina-oruro.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=FgDZnjPKoDE',
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
    fotoUrl: '/images/participantes/duo-kantuta.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=awLznMIPuMw',
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

  for (const { nombre, ...limites } of CATEGORIAS_BASE) {
    const categoria = await prisma.categoria.upsert({
      where: { nombre },
      update: limites,
      create: { nombre, ...limites },
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
          // Datos de ejemplo para mostrar en el sitio, no postulaciones
          // reales pendientes de revisión.
          estado: 'APROBADO',
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
          // Datos de ejemplo para mostrar en el sitio, no postulaciones
          // reales pendientes de revisión.
          estado: 'APROBADO',
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

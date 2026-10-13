import { PrismaClient, Departamento, EstadoInscripcion } from '@prisma/client';

// Datos de PRUEBA solo para desarrollo local — nunca correr en producción.
// Crea las categorías de la convocatoria (si faltan) y 2 postulaciones por
// categoría (menos Ñusta), con estados variados para probar el panel de
// inscritos y /verifica-tu-inscripcion. Todas llevan " (prueba)" al final del
// nombre: al volver a correrlo se borran y se recrean, sin duplicar.
// Correr con `bun run db:seed-dev` desde packages/database.
const prisma = new PrismaClient();

const SUFIJO = ' (prueba)';

// Espeja apps/web/src/lib/categorias.ts.
const CATEGORIAS = [
  { nombre: 'Solista vocal', integrantesMin: 1, integrantesMax: 1, acompanantesMax: 5 },
  { nombre: 'Solista instrumental – Armónico', integrantesMin: 1, integrantesMax: 1, acompanantesMax: 1 },
  { nombre: 'Solista instrumental – Melódico', integrantesMin: 1, integrantesMax: 1, acompanantesMax: 1 },
  { nombre: 'Dúo vocal instrumental', integrantesMin: 2, integrantesMax: 2, acompanantesMax: 0 },
  { nombre: 'Trío vocal instrumental', integrantesMin: 3, integrantesMax: 3, acompanantesMax: 0 },
  { nombre: 'Grupo vocal instrumental', integrantesMin: 4, integrantesMax: 8, acompanantesMax: 0 },
  { nombre: 'Estudiantina', integrantesMin: 8, integrantesMax: 15, acompanantesMax: 0, duracionMaximaMinutos: 7 },
  {
    nombre: 'Ñusta',
    integrantesMin: 1,
    integrantesMax: 1,
    acompanantesMax: 0,
    edadMinima: 16,
    edadMaxima: 25,
    duracionMaximaMinutos: 10,
  },
  { nombre: 'Autóctono', integrantesMin: 8, integrantesMax: 20, acompanantesMax: 0, duracionMaximaMinutos: 7 },
  {
    nombre: 'Solista vocal infantil',
    integrantesMin: 1,
    integrantesMax: 1,
    acompanantesMax: 5,
    edadMaxima: 12,
    requiereAdultoResponsable: true,
  },
  {
    nombre: 'Solista instrumental infantil',
    integrantesMin: 1,
    integrantesMax: 1,
    acompanantesMax: 1,
    edadMaxima: 12,
    requiereAdultoResponsable: true,
  },
  { nombre: 'Composición', integrantesMin: 1, integrantesMax: 1, acompanantesMax: 5 },
  { nombre: 'Especial', integrantesMin: 1, integrantesMax: 11, acompanantesMax: 0 },
];

const NOMBRES = [
  'Lucía Mamani', 'Carlos Quispe', 'Ana Flores', 'Jorge Choque', 'María Condori', 'Luis Vargas',
  'Sofía Rojas', 'Diego Gutiérrez', 'Valeria Torrez', 'Andrés Limachi', 'Camila Arce', 'Mateo Cruz',
  'Daniela Poma', 'Bruno Calle', 'Paola Huanca', 'Iván Ticona', 'Gabriela Soria', 'Rodrigo Apaza',
  'Fernanda Laura', 'Marco Villca',
];
const DEPARTAMENTOS = Object.values(Departamento);
const EXTENSIONES: Record<Departamento, string> = {
  LA_PAZ: 'LP', COCHABAMBA: 'CB', SANTA_CRUZ: 'SC', ORURO: 'OR', POTOSI: 'PT',
  CHUQUISACA: 'CH', TARIJA: 'TJ', BENI: 'BN', PANDO: 'PD',
};
const RITMOS = ['Morenada', 'Caporal', 'Huayño', 'Cueca', 'Taquirari', 'Saya', 'Tinku', 'Kullawada'];
// Rota por categoría para que cada estado aparezca varias veces.
const ESTADOS = [
  EstadoInscripcion.SIN_CONFIRMAR,
  EstadoInscripcion.PRESELECCION,
  EstadoInscripcion.PARTICIPANTE_FINAL,
  EstadoInscripcion.RECHAZADO,
];

let siguienteCi = 7_100_001;
let indiceNombre = 0;
const nuevoCi = () => String(siguienteCi++);
const nuevoNombre = () => NOMBRES[indiceNombre++ % NOMBRES.length];
const fechaHaceAnios = (anios: number) => new Date(Date.UTC(2026 - anios, 2, 14));

async function main() {
  const borradosCantantes = await prisma.cantante.deleteMany({ where: { nombre: { endsWith: SUFIJO } } });
  const borradosGrupos = await prisma.grupo.deleteMany({ where: { nombre: { endsWith: SUFIJO } } });
  if (borradosCantantes.count + borradosGrupos.count > 0) {
    console.log(`Borradas ${borradosCantantes.count + borradosGrupos.count} postulaciones de prueba anteriores.`);
  }

  const resumen: { categoria: string; nombre: string; estado: string; cis: string[] }[] = [];
  let n = 0;

  for (const datos of CATEGORIAS) {
    const categoria = await prisma.categoria.upsert({
      where: { nombre: datos.nombre },
      update: {},
      create: datos,
    });
    if (datos.nombre === 'Ñusta') continue;

    for (let i = 0; i < 2; i++, n++) {
      const departamento = DEPARTAMENTOS[n % DEPARTAMENTOS.length];
      const estado = ESTADOS[n % ESTADOS.length];
      const comunes = {
        categoriaId: categoria.id,
        departamento,
        tituloTema: `Tema de prueba ${n + 1}`,
        autorCompositor: nuevoNombre(),
        ritmo: RITMOS[n % RITMOS.length],
        tiempo: '4:30',
        celular1: `7${String(1_000_000 + n).slice(-7)}`,
        aceptaBases: true,
        declaracionVoluntaria: true,
        estado,
      };

      if (categoria.integrantesMax > 1) {
        const cantidad = categoria.integrantesMin + i;
        const integrantes = Array.from({ length: cantidad }, (_, k) => ({
          nombre: nuevoNombre(),
          instrumento: k === 0 ? 'Voz' : ['Charango', 'Guitarra', 'Quena', 'Zampoña', 'Bombo'][k % 5],
          ciNumero: nuevoCi(),
          ciExtension: EXTENSIONES[departamento],
          fechaNacimiento: fechaHaceAnios(20 + k),
          whatsapp: `6${String(2_000_000 + n * 20 + k).slice(-7)}`,
          direccion: 'Calle de prueba 123',
        }));
        const nombre = `Conjunto ${RITMOS[(n + 3) % RITMOS.length]} ${n + 1}${SUFIJO}`;
        await prisma.grupo.create({
          data: { ...comunes, nombre, integrantes: { create: integrantes } },
        });
        resumen.push({ categoria: datos.nombre, nombre, estado, cis: integrantes.map((x) => x.ciNumero) });
      } else {
        const infantil = Boolean(datos.requiereAdultoResponsable);
        const ciNumero = nuevoCi();
        const acompanantes =
          categoria.acompanantesMax > 0 && i === 1
            ? [{ nombre: nuevoNombre(), ciNumero: nuevoCi(), ciExtension: EXTENSIONES[departamento], instrumento: 'Guitarra' }]
            : [];
        const nombre = `${nuevoNombre()}${SUFIJO}`;
        await prisma.cantante.create({
          data: {
            ...comunes,
            nombre,
            pseudonimo: datos.nombre === 'Composición' ? `Seudónimo ${n + 1}` : null,
            ciNumero,
            ciExtension: EXTENSIONES[departamento],
            fechaNacimiento: fechaHaceAnios(infantil ? 10 : 24),
            whatsapp: comunes.celular1,
            direccion: 'Calle de prueba 123',
            ...(infantil && {
              adultoResponsableNombre: nuevoNombre(),
              adultoResponsableCiNumero: nuevoCi(),
              adultoResponsableCiExtension: EXTENSIONES[departamento],
              adultoResponsableCelular: '70000000',
              autorizaParticipacionAdultoResponsable: true,
            }),
            acompanantes: { create: acompanantes },
          },
        });
        resumen.push({
          categoria: datos.nombre,
          nombre,
          estado,
          cis: [ciNumero, ...acompanantes.map((a) => `${a.ciNumero} (acomp.)`)],
        });
      }
    }
  }

  console.table(resumen.map((r) => ({ ...r, cis: r.cis.join(', ') })));
  console.log(`Listo: ${resumen.length} postulaciones de prueba creadas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

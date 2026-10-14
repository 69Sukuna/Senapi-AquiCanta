import type { ConteoVotos, ParticipanteCalificacion } from '@/types';

// Avatar de iniciales en vez de una foto real — mismo criterio que
// fotoPlaceholder() en packages/database/prisma/seed.ts. Antes estos
// participantes ficticios usaban fotos sueltas de internet (sitios de
// chismes, Reddit, bancos de imágenes) como "standin"; se saca a propósito
// para no mezclar fotos de desconocidos con nombres inventados en el
// software que se registra ante SENAPI.
function avatarIniciales(nombre: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=e0a527&color=170406&size=400&bold=true`;
}

export const PARTICIPANTES_CALIFICACION: ParticipanteCalificacion[] = [
  {
    id: 'p-01',
    nombreArtistico: 'Kantuta del Altiplano',
    categoria: 'Ñusta',
    departamento: 'La Paz',
    imagen: avatarIniciales('Kantuta del Altiplano'),
    obra: { titulo: 'Luz de mi Altiplano', ritmo: 'Cueca paceña', autor: 'E. Calderón', duracionSegundos: 258 },
    instrumentos: ['Charango', 'Bombo', 'Voz'],
    parametros: { tecnicaVocal: 94, dominioInstrumental: 89, indumentariaTipica: 96, dominioEscenario: 92 },
  },
  {
    id: 'p-02',
    nombreArtistico: 'Los Wayras',
    categoria: 'Grupo Vocal Instrumental',
    departamento: 'Cochabamba',
    imagen: avatarIniciales('Los Wayras'),
    obra: { titulo: 'Ecos de Cochabamba', ritmo: 'Kaluyo', autor: 'Los Wayras', duracionSegundos: 271 },
    instrumentos: ['Charango', 'Guitarra', 'Quena'],
    parametros: { tecnicaVocal: 88, dominioInstrumental: 91, indumentariaTipica: 85, dominioEscenario: 89 },
  },
  {
    id: 'p-03',
    nombreArtistico: 'Valentina Rocabado',
    categoria: 'Solista Vocal',
    departamento: 'Santa Cruz',
    imagen: avatarIniciales('Valentina Rocabado'),
    obra: { titulo: 'Sombra de Taquirari', ritmo: 'Taquirari', autor: 'V. Rocabado', duracionSegundos: 249 },
    instrumentos: ['Voz', 'Guitarra'],
    parametros: { tecnicaVocal: 97, dominioInstrumental: 80, indumentariaTipica: 93, dominioEscenario: 95 },
  },
  {
    id: 'p-04',
    nombreArtistico: 'Dúo Sayariy',
    categoria: 'Dúo Vocal Instrumental',
    departamento: 'Oruro',
    imagen: avatarIniciales('Dúo Sayariy'),
    obra: { titulo: 'Diablada del Alma', ritmo: 'Diablada', autor: 'Colectiva', duracionSegundos: 284 },
    instrumentos: ['Zampoña', 'Bombo'],
    parametros: { tecnicaVocal: 85, dominioInstrumental: 90, indumentariaTipica: 94, dominioEscenario: 88 },
  },
  {
    id: 'p-05',
    nombreArtistico: 'Rayo de Plata',
    categoria: 'Solista Instrumental – Armónico',
    departamento: 'Potosí',
    imagen: avatarIniciales('Rayo de Plata'),
    obra: { titulo: 'Vientos de Potosí', ritmo: 'Huayño', autor: 'Tradicional', duracionSegundos: 232 },
    instrumentos: ['Charango'],
    parametros: { tecnicaVocal: 82, dominioInstrumental: 96, indumentariaTipica: 87, dominioEscenario: 90 },
  },
  {
    id: 'p-06',
    nombreArtistico: 'Banda Chuquisaca',
    categoria: 'Estudiantina',
    departamento: 'Chuquisaca',
    imagen: avatarIniciales('Banda Chuquisaca'),
    obra: { titulo: 'Serenata Chuquisaqueña', ritmo: 'Bailecito', autor: 'Banda Chuquisaca', duracionSegundos: 265 },
    instrumentos: ['Mandolina', 'Guitarra', 'Charango'],
    parametros: { tecnicaVocal: 83, dominioInstrumental: 92, indumentariaTipica: 90, dominioEscenario: 86 },
  },
  {
    id: 'p-07',
    nombreArtistico: 'Marcelo Villca',
    categoria: 'Solista Vocal',
    departamento: 'Tarija',
    imagen: avatarIniciales('Marcelo Villca'),
    obra: { titulo: 'Coplas del Valle', ritmo: 'Chacarera', autor: 'M. Villca', duracionSegundos: 240 },
    instrumentos: ['Guitarra', 'Violín'],
    parametros: { tecnicaVocal: 90, dominioInstrumental: 84, indumentariaTipica: 88, dominioEscenario: 91 },
  },
  {
    id: 'p-08',
    nombreArtistico: 'Sonido del Beni',
    categoria: 'Autóctono',
    departamento: 'Beni',
    imagen: avatarIniciales('Sonido del Beni'),
    obra: { titulo: 'Memoria del Ayllu', ritmo: 'Tarkada', autor: 'Tradicional', duracionSegundos: 281 },
    instrumentos: ['Tarka', 'Wankara', 'Pututu'],
    parametros: { tecnicaVocal: 85, dominioInstrumental: 95, indumentariaTipica: 97, dominioEscenario: 86 },
  },
];

export const CONTEO_INICIAL_VOTACION_PREVIA: ConteoVotos = {
  'p-01': 128,
  'p-02': 94,
  'p-03': 156,
  'p-04': 62,
  'p-05': 110,
  'p-06': 45,
  'p-07': 88,
  'p-08': 73,
};

export const CONTEO_INICIAL_VOTACION_VIVO: ConteoVotos = {
  'p-01': 512,
  'p-02': 340,
  'p-03': 601,
  'p-04': 275,
  'p-05': 398,
  'p-06': 190,
  'p-07': 322,
  'p-08': 264,
};

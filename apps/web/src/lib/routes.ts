// Lista central de rutas del sitio. Cualquier <Link> debe importar de acá
// en vez de escribir el path a mano, para cambiar una URL en un solo lugar.
export const ROUTES = {
  home: '/',
  categorias: '/categorias',
  participante: '/participante',
  inscripciones: '/inscripciones',
  verificaInscripcion: '/verifica-tu-inscripcion',
  cronograma: '/cronograma',
  butacas: '/butacas',
  realidadVirtual: '/realidad-virtual',
  votaciones: '/votaciones',
  calificacionJurado: '/calificacion-jurado',
  sellos: '/sellos',
  login: '/login',
  registro: '/registro',
  perfil: '/perfil',
  admin: {
    root: '/adminpanel',
    usuarios: '/adminpanel/usuarios',
    inscritos: '/adminpanel/inscritos',
    resultados: '/adminpanel/resultados',
    vistas: '/adminpanel/vistas',
    sellos: '/adminpanel/sellos',
  },
} as const;

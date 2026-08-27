// Lista central de rutas del sitio. Cualquier <Link> debe importar de acá
// en vez de escribir el path a mano, para cambiar una URL en un solo lugar.
export const ROUTES = {
  home: '/',
  categorias: '/categorias',
  cantante: '/cantante',
  grupo: '/grupo',
  inscripciones: '/inscripciones',
  asientosReserva: '/asientos-reserva',
  realidadVirtual: '/realidad-virtual',
  votacionPrevia: '/votacion-previa',
  votacionVivo: '/votacion-vivo',
  calificacionJurado: '/calificacion-jurado',
  login: '/login',
  registro: '/registro',
  perfil: '/perfil',
  admin: {
    root: '/adminpanel',
    usuarios: '/adminpanel/usuarios',
    inscritos: '/adminpanel/inscritos',
    categorias: '/adminpanel/categorias',
    resultados: '/adminpanel/resultados',
  },
} as const;

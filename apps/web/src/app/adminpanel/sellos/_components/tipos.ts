export interface PuntoAdmin {
  id: string;
  eventoId: string;
  instancia: string | null;
  nombre: string | null;
  codigo: string;
  imagenUrl: string | null;
}

export interface EventoAdmin {
  id: string;
  trayectoId: string;
  nombre: string;
  orden: number;
  imagenUrl: string | null;
  puntos: PuntoAdmin[];
}

export interface RangoAdmin {
  id: string;
  trayectoId: string;
  nombre: string;
  orden: number;
  eventos: { id: string; nombre: string }[];
}

// Medalla ya no cuelga de ningún trayecto — es global (ver schema.prisma).
export interface MedallaAdmin {
  id: string;
  nombre: string;
  descripcion: string;
  umbral: number;
  orden: number;
  imagenUrl: string | null;
}

export interface TrayectoAdmin {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
  // Si la vista pública muestra `visitantesUnicos` en la tarjeta de este
  // trayecto (el panel admin siempre lo ve, sin importar este valor).
  mostrarConteoVisitantes: boolean;
  eventos: EventoAdmin[];
  rangos: RangoAdmin[];
  // Cantidad de visitantes DISTINTOS que escanearon al menos un punto de
  // cualquier evento de este trayecto.
  visitantesUnicos: number;
}

export type PestanaSellos = 'trayecto' | 'eventos' | 'rangos' | 'medallas';

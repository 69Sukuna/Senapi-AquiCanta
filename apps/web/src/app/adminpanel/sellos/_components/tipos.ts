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
  eventos: EventoAdmin[];
  rangos: RangoAdmin[];
}

export type PestanaSellos = 'trayecto' | 'eventos' | 'rangos' | 'medallas';

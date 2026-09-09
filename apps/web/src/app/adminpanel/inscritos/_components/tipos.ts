import type { EstadoInscripcion } from '@/lib/estadoInscripcion';

export interface CategoriaRef {
  id: string;
  nombre: string;
}

export interface AcompananteItem {
  id: string;
  nombre: string;
  ciNumero: string | null;
  ciExtension: string | null;
  instrumento: string | null;
}

export interface IntegranteItem {
  id: string;
  nombre: string;
  nombreReferencia: string | null;
  instrumento: string | null;
  fotoUrl: string | null;
  ciNumero: string | null;
  ciExtension: string | null;
  fechaNacimiento: string | null;
  whatsapp: string | null;
  direccion: string | null;
}

interface InscritoBase {
  id: string;
  nombre: string;
  pseudonimo: string | null;
  tituloTema: string | null;
  autorCompositor: string | null;
  ritmo: string | null;
  tiempo: string | null;
  departamento: string | null;
  fotoUrl: string | null;
  videoUrl: string | null;
  categoriaId: string;
  categoria: CategoriaRef;
  celular1: string | null;
  celular2: string | null;
  aceptaBases: boolean;
  declaracionVoluntaria: boolean;
  estado: EstadoInscripcion;
  createdAt: string;
  updatedAt: string;
}

export interface InscritoCantante extends InscritoBase {
  tipo: 'CANTANTE';
  ciNumero: string | null;
  ciExtension: string | null;
  fechaNacimiento: string | null;
  whatsapp: string | null;
  direccion: string | null;
  adultoResponsableNombre: string | null;
  adultoResponsableCiNumero: string | null;
  adultoResponsableCiExtension: string | null;
  adultoResponsableCelular: string | null;
  autorizaParticipacionAdultoResponsable: boolean;
  acompanantes: AcompananteItem[];
}

export interface InscritoGrupo extends InscritoBase {
  tipo: 'GRUPO';
  integrantes: IntegranteItem[];
}

export type Inscrito = InscritoCantante | InscritoGrupo;

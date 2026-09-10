import { IsEnum, IsOptional, IsUUID } from 'class-validator';

// A qué persona/registro corresponde cada foto del array `fotos` del
// multipart. GRUPO_CARNETS_BULK no lleva `lado` ni `id` — es un adjunto a
// nivel del Grupo completo (ver Grupo.fotosCarnetsGrupalUrls), pensado para
// categorías con muchos integrantes donde pedir anverso/reverso uno por uno
// es demasiada carga para llenar desde el celular.
export enum TipoObjetivoFoto {
  POSTULANTE = 'POSTULANTE',
  INTEGRANTE = 'INTEGRANTE',
  ACOMPANANTE = 'ACOMPANANTE',
  ADULTO_RESPONSABLE = 'ADULTO_RESPONSABLE',
  GRUPO_CARNETS_BULK = 'GRUPO_CARNETS_BULK',
}

export enum LadoFotoCi {
  ANVERSO = 'ANVERSO',
  REVERSO = 'REVERSO',
}

// Este DTO no llega como @Body() nativo (el request es multipart/form-data
// con el resto del array como un campo de texto), así que se valida a mano
// en el controller con class-transformer/class-validator en vez de dejar
// que lo haga el ValidationPipe global.
export class ObjetivoFotoDto {
  @IsEnum(TipoObjetivoFoto)
  tipo!: TipoObjetivoFoto;

  @IsOptional()
  @IsEnum(LadoFotoCi)
  lado?: LadoFotoCi;

  @IsOptional()
  @IsUUID()
  id?: string;
}

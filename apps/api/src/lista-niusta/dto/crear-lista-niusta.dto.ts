import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';

// Máximo de canciones adicionales: la convocatoria permite hasta 7 temas en
// Ñusta y el primero ya viaja en la inscripción principal.
export const MAX_CANCIONES_ADICIONALES = 6;

export class CancionNiustaDto {
  @ApiProperty({ example: 'Viva mi patria Bolivia' })
  @IsString()
  @IsNotEmpty()
  tituloTema!: string;

  @ApiProperty({ example: 'Apolinar Camacho' })
  @IsString()
  @IsNotEmpty()
  autorCompositor!: string;

  @ApiProperty({ example: 'Cueca' })
  @IsString()
  @IsNotEmpty()
  ritmo!: string;

  @ApiProperty({ description: 'Duración en minutos (ej. "3.5")', example: '3.5' })
  @IsString()
  @IsNotEmpty()
  tiempo!: string;
}

export class CrearListaNiustaDto {
  @ApiProperty({ description: 'id del Cantante devuelto por POST /inscripciones' })
  @IsUUID()
  cantanteId!: string;

  @ApiProperty({ type: [CancionNiustaDto], description: `De 1 a ${MAX_CANCIONES_ADICIONALES} canciones, en orden` })
  @ValidateNested({ each: true })
  @Type(() => CancionNiustaDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_CANCIONES_ADICIONALES)
  canciones!: CancionNiustaDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

// Compartido por Eventos, Rangos y Medallas: el admin reordena moviendo filas
// (flechas subir/bajar) en vez de escribir un número a mano, así que acá solo
// viaja el orden final — el service renumera 1..N según la posición en el
// array, sin importar los valores de `orden` que hubiera antes.
export class ReordenarDto {
  @ApiProperty({ type: [String], description: 'IDs en el orden final deseado' })
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

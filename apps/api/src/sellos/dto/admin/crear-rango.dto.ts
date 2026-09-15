import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CrearRangoDto {
  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiProperty({ type: [String], description: 'IDs de los Eventos que este rango exige completados' })
  @IsArray()
  @IsString({ each: true })
  eventoIds!: string[];
}

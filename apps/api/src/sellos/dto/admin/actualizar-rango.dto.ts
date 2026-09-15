import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ActualizarRangoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ type: [String], description: 'Reemplaza por completo el conjunto de Eventos exigidos' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventoIds?: string[];
}

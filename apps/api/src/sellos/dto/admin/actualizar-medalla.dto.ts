import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ActualizarMedallaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  umbral?: number;

  @ApiPropertyOptional({ description: 'Arte de la medalla; vacío = usa el arte fijo por posición' })
  @IsOptional()
  @IsString()
  imagenUrl?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CrearMedallaDto {
  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiProperty()
  @IsString()
  descripcion!: string;

  @ApiProperty({ description: 'Cantidad mínima de sellos escaneados para desbloquearla' })
  @IsInt()
  @Min(1)
  umbral!: number;

  @ApiPropertyOptional({ description: 'Arte de la medalla; vacío = usa el arte fijo por posición' })
  @IsOptional()
  @IsString()
  imagenUrl?: string;
}

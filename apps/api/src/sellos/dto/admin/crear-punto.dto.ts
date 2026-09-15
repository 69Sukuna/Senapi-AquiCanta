import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CrearPuntoDto {
  @ApiPropertyOptional({ description: 'Etiqueta de la repetición (ej. "Sábado"); vacío = ocurrencia única' })
  @IsOptional()
  @IsString()
  instancia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ description: 'Código único codificado en el QR físico de este punto' })
  @IsString()
  codigo!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagenUrl?: string;
}

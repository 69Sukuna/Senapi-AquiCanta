import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Departamento } from '@repo/database';

// Superset de los campos editables de Cantante y Grupo desde el panel de
// administración. El servicio filtra, según el tipo, cuáles de estos campos
// aplican al modelo correspondiente antes de pasarlos a Prisma — Cantante y
// Grupo no comparten exactamente los mismos campos (ej. ciNumero es solo de
// Cantante), y Prisma rechaza en tiempo de ejecución cualquier campo que no
// exista en el modelo que se está actualizando.
export class ActualizarInscripcionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pseudonimo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tituloTema?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  autorCompositor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ritmo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tiempo?: string;

  @ApiPropertyOptional({ enum: Departamento })
  @IsOptional()
  @IsEnum(Departamento)
  departamento?: Departamento;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  celular1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  celular2?: string;

  // Solo Cantante — datos personales privados.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ciNumero?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ciExtension?: string;

  @ApiPropertyOptional({ description: 'Fecha de nacimiento (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adultoResponsableNombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adultoResponsableCiNumero?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adultoResponsableCiExtension?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adultoResponsableCelular?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autorizaParticipacionAdultoResponsable?: boolean;
}

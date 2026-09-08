import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Departamento } from '@repo/database';

export class IntegranteDto {
  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiProperty()
  @IsString()
  ciNumero!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ciExtension?: string;

  @ApiProperty({ description: 'Fecha de nacimiento (ISO 8601, ej. 2005-03-14)' })
  @IsDateString()
  fechaNacimiento!: string;

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
  instrumento?: string;
}

export class AcompananteDto {
  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ciNumero?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ciExtension?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instrumento?: string;
}

export class CrearInscripcionDto {
  @ApiProperty({ description: 'Nombre de la Categoria, tal como figura en el Anexo 1' })
  @IsString()
  categoria!: string;

  @ApiProperty()
  @IsString()
  nombrePostulante!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pseudonimo?: string;

  @ApiProperty()
  @IsString()
  tituloTema!: string;

  @ApiProperty()
  @IsString()
  autorCompositor!: string;

  @ApiProperty()
  @IsString()
  ritmo!: string;

  @ApiProperty()
  @IsString()
  tiempo!: string;

  @ApiProperty({ enum: Departamento })
  @IsEnum(Departamento)
  departamento!: Departamento;

  @ApiProperty()
  @IsString()
  celular1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  celular2?: string;

  @ApiProperty({ type: [IntegranteDto] })
  @ValidateNested({ each: true })
  @Type(() => IntegranteDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  integrantes!: IntegranteDto[];

  @ApiPropertyOptional({
    type: [AcompananteDto],
    description: 'Músicos de acompañamiento (solo para categorías individuales que lo permiten)',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AcompananteDto)
  @ArrayMaxSize(20)
  acompanantes?: AcompananteDto[];

  @ApiProperty()
  @IsBoolean()
  aceptaBases!: boolean;

  @ApiProperty()
  @IsBoolean()
  declaracionVoluntaria!: boolean;

  @ApiPropertyOptional({ description: 'Nombre del adulto responsable (padre/madre/tutor) — categorías infantiles' })
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

  @ApiPropertyOptional({ description: 'Celular del adulto responsable — categorías infantiles' })
  @IsOptional()
  @IsString()
  adultoResponsableCelular?: string;

  @ApiPropertyOptional({
    description:
      'Aceptación digital de los términos del Anexo 4 (carta de autorización de participación) — categorías infantiles',
  })
  @IsOptional()
  @IsBoolean()
  autorizaParticipacionAdultoResponsable?: boolean;
}

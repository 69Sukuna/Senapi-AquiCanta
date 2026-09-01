import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
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

  @ApiProperty()
  @IsString()
  edad!: string;

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

  @ApiProperty()
  @IsBoolean()
  aceptaBases!: boolean;

  @ApiProperty()
  @IsBoolean()
  declaracionVoluntaria!: boolean;
}

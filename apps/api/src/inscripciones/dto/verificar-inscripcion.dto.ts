import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VerificarInscripcionDto {
  @ApiProperty({ description: 'Número de carnet de identidad del participante' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  ciNumero!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoInscripcion } from '@repo/database';

export class ActualizarEstadoDto {
  @ApiProperty({ enum: EstadoInscripcion })
  @IsEnum(EstadoInscripcion)
  estado!: EstadoInscripcion;
}

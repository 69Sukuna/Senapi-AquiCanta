import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VincularVisitanteDto {
  @ApiProperty({ description: 'UUID anónimo que tenía el visitante en localStorage antes de loguearse' })
  @IsUUID()
  visitorIdAnonimo!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ActualizarConfiguracionVistaDto {
  @ApiProperty({ description: 'true = la vista está visible y funcionando; false = muestra un aviso de "cerrado"' })
  @IsBoolean()
  activo!: boolean;
}

import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EscanearPuntoDto {
  @ApiProperty({ description: 'Código codificado en el QR/imagen física del punto de escaneo' })
  @IsString()
  codigo!: string;

  @ApiProperty({ description: 'UUID anónimo del visitante, generado y persistido en su navegador' })
  @IsUUID()
  visitorId!: string;
}

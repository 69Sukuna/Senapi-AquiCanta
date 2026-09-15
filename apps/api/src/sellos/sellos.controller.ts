import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SellosService } from './sellos.service';
import { EscanearPuntoDto } from './dto/escanear-punto.dto';

@ApiTags('Sellos')
@Controller('sellos')
export class SellosController {
  constructor(private readonly sellosService: SellosService) {}

  @Get('trayectos')
  @ApiOperation({ summary: 'Listar los trayectos activos con sus eventos y puntos de escaneo' })
  listarTrayectos() {
    return this.sellosService.listarTrayectos();
  }

  @Get('trayectos/:id/progreso/:visitorId')
  @ApiOperation({ summary: 'Progreso de un visitante en un trayecto: eventos, rangos y si lo completó' })
  progreso(@Param('id') id: string, @Param('visitorId') visitorId: string) {
    return this.sellosService.progreso(id, visitorId);
  }

  @Get('medallas/:visitorId')
  @ApiOperation({ summary: 'Medallas globales de un visitante — por cantidad TOTAL de sellos, sin importar el trayecto' })
  medallas(@Param('visitorId') visitorId: string) {
    return this.sellosService.medallasGlobales(visitorId);
  }

  @Post('escanear')
  @ApiOperation({ summary: 'Registrar el escaneo de un punto (QR/imagen) por un visitante' })
  escanear(@Body() dto: EscanearPuntoDto) {
    return this.sellosService.escanear(dto);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SellosService } from './sellos.service';
import { EscanearPuntoDto } from './dto/escanear-punto.dto';
import { VincularVisitanteDto } from './dto/vincular-visitante.dto';
import { VisitanteJwtAuthGuard } from '../visitantes/guards/visitante-jwt-auth.guard';
import { CurrentVisitante } from '../visitantes/decorators/current-visitante.decorator';
import type { VisitanteAutenticado } from '../visitantes/visitante-payload';

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

  @Post('vincular')
  @UseGuards(VisitanteJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fusionar el progreso anónimo (localStorage) del visitante con su cuenta recién logueada' })
  vincular(@CurrentVisitante() visitante: VisitanteAutenticado, @Body() dto: VincularVisitanteDto) {
    // El userId sale del token verificado, nunca del body — el body solo
    // aporta qué UUID anónimo hay que fusionar.
    return this.sellosService.vincularVisitante(visitante.id, dto.visitorIdAnonimo);
  }
}

import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EstadoInscripcion } from '@repo/database';
import { InscripcionesService } from './inscripciones.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';

@ApiTags('Inscripciones')
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva postulación (Anexo 1) como Cantante o Grupo' })
  crear(@Body() dto: CrearInscripcionDto) {
    return this.inscripcionesService.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar postulaciones (cantantes y grupos) para el panel de administración' })
  listar(@Query('estado') estado?: EstadoInscripcion) {
    return this.inscripcionesService.listarPendientes(estado);
  }

  @Patch(':tipo/:id/estado')
  @ApiOperation({ summary: 'Aprobar o rechazar una postulación' })
  actualizarEstado(@Param('tipo') tipo: string, @Param('id') id: string, @Body() dto: ActualizarEstadoDto) {
    return this.inscripcionesService.actualizarEstado(tipo, id, dto.estado);
  }
}

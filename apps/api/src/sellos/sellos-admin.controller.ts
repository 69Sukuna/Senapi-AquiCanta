import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@repo/database';
import { SellosService } from './sellos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CrearTrayectoDto } from './dto/admin/crear-trayecto.dto';
import { ActualizarTrayectoDto } from './dto/admin/actualizar-trayecto.dto';
import { CrearEventoDto } from './dto/admin/crear-evento.dto';
import { ActualizarEventoDto } from './dto/admin/actualizar-evento.dto';
import { CrearPuntoDto } from './dto/admin/crear-punto.dto';
import { ActualizarPuntoDto } from './dto/admin/actualizar-punto.dto';
import { CrearRangoDto } from './dto/admin/crear-rango.dto';
import { ActualizarRangoDto } from './dto/admin/actualizar-rango.dto';
import { CrearMedallaDto } from './dto/admin/crear-medalla.dto';
import { ActualizarMedallaDto } from './dto/admin/actualizar-medalla.dto';
import { ReordenarDto } from './dto/admin/reordenar.dto';

// Toda la superficie de este controller es exclusiva del panel de
// administración — a diferencia de SellosController (público), acá tiene
// sentido aplicar los guards una sola vez a nivel de clase en vez de
// repetirlos en cada uno de los ~16 handlers.
@ApiTags('Sellos (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('sellos/admin')
export class SellosAdminController {
  constructor(private readonly sellosService: SellosService) {}

  @Get('trayectos')
  @ApiOperation({ summary: 'Listar todos los trayectos (incl. inactivos) con su árbol completo — panel de administración' })
  listarTrayectos() {
    return this.sellosService.listarTrayectosAdmin();
  }

  @Post('trayectos')
  @ApiOperation({ summary: 'Crear un trayecto' })
  crearTrayecto(@Body() dto: CrearTrayectoDto) {
    return this.sellosService.crearTrayecto(dto);
  }

  @Patch('trayectos/:id')
  @ApiOperation({ summary: 'Editar un trayecto' })
  actualizarTrayecto(@Param('id') id: string, @Body() dto: ActualizarTrayectoDto) {
    return this.sellosService.actualizarTrayecto(id, dto);
  }

  @Delete('trayectos/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un trayecto (y en cascada sus eventos, puntos, rangos y medallas)' })
  eliminarTrayecto(@Param('id') id: string) {
    return this.sellosService.eliminarTrayecto(id);
  }

  @Post('trayectos/:trayectoId/eventos')
  @ApiOperation({ summary: 'Crear un evento dentro de un trayecto' })
  crearEvento(@Param('trayectoId') trayectoId: string, @Body() dto: CrearEventoDto) {
    return this.sellosService.crearEvento(trayectoId, dto);
  }

  @Patch('eventos/:id')
  @ApiOperation({ summary: 'Editar un evento' })
  actualizarEvento(@Param('id') id: string, @Body() dto: ActualizarEventoDto) {
    return this.sellosService.actualizarEvento(id, dto);
  }

  @Delete('eventos/:id')
  @ApiOperation({ summary: 'Eliminar un evento (y en cascada sus puntos de escaneo)' })
  eliminarEvento(@Param('id') id: string) {
    return this.sellosService.eliminarEvento(id);
  }

  @Patch('trayectos/:trayectoId/eventos/orden')
  @ApiOperation({ summary: 'Reordenar los eventos de un trayecto (mover subir/bajar en el panel)' })
  reordenarEventos(@Param('trayectoId') trayectoId: string, @Body() dto: ReordenarDto) {
    return this.sellosService.reordenarEventos(trayectoId, dto.ids);
  }

  @Post('eventos/:eventoId/puntos')
  @ApiOperation({ summary: 'Crear un punto de escaneo (QR físico) dentro de un evento' })
  crearPunto(@Param('eventoId') eventoId: string, @Body() dto: CrearPuntoDto) {
    return this.sellosService.crearPunto(eventoId, dto);
  }

  @Patch('puntos/:id')
  @ApiOperation({ summary: 'Editar un punto de escaneo' })
  actualizarPunto(@Param('id') id: string, @Body() dto: ActualizarPuntoDto) {
    return this.sellosService.actualizarPunto(id, dto);
  }

  @Delete('puntos/:id')
  @ApiOperation({ summary: 'Eliminar un punto de escaneo' })
  eliminarPunto(@Param('id') id: string) {
    return this.sellosService.eliminarPunto(id);
  }

  @Post('trayectos/:trayectoId/rangos')
  @ApiOperation({ summary: 'Crear un rango dentro de un trayecto' })
  crearRango(@Param('trayectoId') trayectoId: string, @Body() dto: CrearRangoDto) {
    return this.sellosService.crearRango(trayectoId, dto);
  }

  @Patch('rangos/:id')
  @ApiOperation({ summary: 'Editar un rango' })
  actualizarRango(@Param('id') id: string, @Body() dto: ActualizarRangoDto) {
    return this.sellosService.actualizarRango(id, dto);
  }

  @Delete('rangos/:id')
  @ApiOperation({ summary: 'Eliminar un rango' })
  eliminarRango(@Param('id') id: string) {
    return this.sellosService.eliminarRango(id);
  }

  @Patch('trayectos/:trayectoId/rangos/orden')
  @ApiOperation({ summary: 'Reordenar los rangos de un trayecto (mover subir/bajar en el panel)' })
  reordenarRangos(@Param('trayectoId') trayectoId: string, @Body() dto: ReordenarDto) {
    return this.sellosService.reordenarRangos(trayectoId, dto.ids);
  }

  @Get('medallas')
  @ApiOperation({ summary: 'Listar las medallas globales (no dependen de ningún trayecto)' })
  listarMedallas() {
    return this.sellosService.listarMedallasAdmin();
  }

  @Post('medallas')
  @ApiOperation({ summary: 'Crear una medalla global' })
  crearMedalla(@Body() dto: CrearMedallaDto) {
    return this.sellosService.crearMedallaGlobal(dto);
  }

  // Declarado ANTES de `medallas/:id`: con el mismo prefijo, Nest/Express
  // resuelve por orden de registro — si `:id` fuera primero, capturaría
  // "orden" como si fuera un id.
  @Patch('medallas/orden')
  @ApiOperation({ summary: 'Reordenar las medallas globales (mover subir/bajar en el panel)' })
  reordenarMedallas(@Body() dto: ReordenarDto) {
    return this.sellosService.reordenarMedallas(dto.ids);
  }

  @Patch('medallas/:id')
  @ApiOperation({ summary: 'Editar una medalla' })
  actualizarMedalla(@Param('id') id: string, @Body() dto: ActualizarMedallaDto) {
    return this.sellosService.actualizarMedalla(id, dto);
  }

  @Delete('medallas/:id')
  @ApiOperation({ summary: 'Eliminar una medalla' })
  eliminarMedalla(@Param('id') id: string) {
    return this.sellosService.eliminarMedalla(id);
  }
}

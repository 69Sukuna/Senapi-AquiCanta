import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@repo/database';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UsuarioAutenticado } from '../auth/jwt-payload';
import { alcanceDe } from '../inscripciones/alcance-inscripciones';
import { ListaNiustaService } from './lista-niusta.service';
import { CrearListaNiustaDto } from './dto/crear-lista-niusta.dto';

@ApiTags('Lista Ñusta')
@Controller('lista-niusta')
export class ListaNiustaController {
  constructor(private readonly listaNiustaService: ListaNiustaService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Registrar las canciones adicionales (2 a 7) de una postulante Ñusta, después de POST /inscripciones',
  })
  crear(@Body() dto: CrearListaNiustaDto) {
    return this.listaNiustaService.crear(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Listar todas las canciones adicionales de Ñusta (un USER solo las de su departamento) — para exportar',
  })
  listarTodas(@CurrentUser() usuario: UsuarioAutenticado) {
    return this.listaNiustaService.listarTodas(alcanceDe(usuario));
  }

  @Get(':cantanteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar las canciones adicionales de una postulante Ñusta — panel de administración',
  })
  listar(@CurrentUser() usuario: UsuarioAutenticado, @Param('cantanteId', ParseUUIDPipe) cantanteId: string) {
    return this.listaNiustaService.listarPorCantante(cantanteId, alcanceDe(usuario));
  }
}

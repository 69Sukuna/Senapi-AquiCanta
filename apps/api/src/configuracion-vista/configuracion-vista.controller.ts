import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@repo/database';
import { ConfiguracionVistaService } from './configuracion-vista.service';
import { ActualizarConfiguracionVistaDto } from './dto/actualizar-configuracion-vista.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Configuración de vistas')
@Controller('configuraciones-vista')
export class ConfiguracionVistaController {
  constructor(private readonly configuracionVistaService: ConfiguracionVistaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar el estado (activo/inactivo) de todas las vistas públicas — panel de administración' })
  findAll() {
    return this.configuracionVistaService.findAll();
  }

  @Get(':clave')
  @ApiOperation({ summary: 'Consultar si una vista pública específica está activa (usado por cada página para saber si debe mostrarse)' })
  findOne(@Param('clave') clave: string) {
    return this.configuracionVistaService.findOne(clave);
  }

  @Patch(':clave')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar o desactivar una vista pública' })
  actualizar(@Param('clave') clave: string, @Body() dto: ActualizarConfiguracionVistaDto) {
    return this.configuracionVistaService.actualizar(clave, dto.activo);
  }
}

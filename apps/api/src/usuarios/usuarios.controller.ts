import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@repo/database';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UsuarioAutenticado } from '../auth/jwt-payload';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuariosService } from './usuarios.service';

// Todo el controller es solo ADMIN: un USER (usuario de departamento) no
// puede ver ni tocar cuentas, ni siquiera la suya.
@ApiTags('Usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar las cuentas del panel (administradores y usuarios de departamento)' })
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  @ApiOperation({ summary: 'Crear una cuenta (ADMIN o USER con departamento)' })
  crear(@Body() dto: CrearUsuarioDto) {
    return this.usuariosService.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar una cuenta — incluye cambiar su contraseña, rol o departamento' })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarUsuarioDto,
    @CurrentUser() actor: UsuarioAutenticado,
  ) {
    return this.usuariosService.actualizar(id, dto, actor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una cuenta (no se puede eliminar la propia)' })
  eliminar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: UsuarioAutenticado) {
    return this.usuariosService.eliminar(id, actor);
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { UsuarioAutenticado } from './jwt-payload';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión con email o nombre de usuario + contraseña' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.identificador, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Datos del usuario autenticado — usado por el frontend para validar el token guardado' })
  me(@CurrentUser() usuario: UsuarioAutenticado) {
    return usuario;
  }
}

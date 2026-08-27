import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health & Info')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verificar el estado del API y conexión a base de datos' })
  @ApiResponse({ status: 200, description: 'Estado general del sistema' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obtener datos iniciales y resumen del sistema' })
  getSummary() {
    return this.appService.getSummary();
  }
}

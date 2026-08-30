import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GruposService } from './grupos.service';

@ApiTags('Grupos')
@Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los grupos' })
  findAll() {
    return this.gruposService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grupo por id, con sus integrantes' })
  findOne(@Param('id') id: string) {
    return this.gruposService.findOne(id);
  }
}

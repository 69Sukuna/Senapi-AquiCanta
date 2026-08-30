import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CantantesService } from './cantantes.service';

@ApiTags('Cantantes')
@Controller('cantantes')
export class CantantesController {
  constructor(private readonly cantantesService: CantantesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los cantantes solistas' })
  findAll() {
    return this.cantantesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cantante por id' })
  findOne(@Param('id') id: string) {
    return this.cantantesService.findOne(id);
  }
}

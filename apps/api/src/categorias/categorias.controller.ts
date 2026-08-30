import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';

@ApiTags('Categorías')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorías' })
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por id' })
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }
}

import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EstadoInscripcion } from '@repo/database';
import { InscripcionesService } from './inscripciones.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';
import { ObjetivoFotoDto } from './dto/subir-fotos.dto';

// Límites de Multer para /fotos: 5MB por foto normalmente, pero
// GRUPO_CARNETS_BULK puede ser un PDF de varias páginas — se deja un tope
// más generoso (10MB) y se valida el tipo exacto por archivo en el service
// según lo que declara cada objetivo, no acá.
const LIMITE_ARCHIVO_BYTES = 10 * 1024 * 1024;
const MIME_TYPES_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

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

  @Post(':tipo/:id/fotos')
  @ApiOperation({
    summary: 'Subir fotos del carnet de identidad (anverso/reverso, por persona o el archivo grupal de carnets)',
  })
  @UseInterceptors(
    FilesInterceptor('fotos', 25, {
      limits: { fileSize: LIMITE_ARCHIVO_BYTES },
      fileFilter: (_req, file, callback) => {
        callback(null, MIME_TYPES_PERMITIDOS.includes(file.mimetype));
      },
    }),
  )
  async subirFotos(
    @Param('tipo') tipo: string,
    @Param('id') id: string,
    @UploadedFiles() fotos: Array<{ buffer: Buffer; mimetype: string; originalname: string }>,
    @Body('objetivos') objetivosRaw: string,
  ) {
    let objetivosCrudos: unknown;
    try {
      objetivosCrudos = JSON.parse(objetivosRaw ?? '[]');
    } catch {
      throw new BadRequestException('"objetivos" debe ser un JSON válido');
    }
    if (!Array.isArray(objetivosCrudos)) {
      throw new BadRequestException('"objetivos" debe ser un array');
    }

    const objetivos = plainToInstance(ObjetivoFotoDto, objetivosCrudos);
    for (const objetivo of objetivos) {
      const errores = validateSync(objetivo);
      if (errores.length > 0) {
        throw new BadRequestException(`Objetivo de foto inválido: ${errores.map((e) => e.toString()).join('; ')}`);
      }
    }

    return this.inscripcionesService.subirFotos(tipo, id, fotos ?? [], objetivos);
  }
}

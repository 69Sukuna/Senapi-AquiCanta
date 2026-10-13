import {
  BadRequestException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { ObjetivoFotoDto } from "./dto/subir-fotos.dto";

// Límites de Multer para /fotos: 5MB por foto normalmente, pero
// GRUPO_CARNETS_BULK puede ser un PDF de varias páginas — se deja un tope
// más generoso (10MB) y se valida el tipo exacto por archivo en el service
// según lo que declara cada objetivo, no acá.
const LIMITE_ARCHIVO_BYTES = 10 * 1024 * 1024;
const MIME_TYPES_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { EstadoInscripcion, Role } from "@repo/database";
import { InscripcionesService } from "./inscripciones.service";
import { CrearInscripcionDto } from "./dto/crear-inscripcion.dto";
import { ActualizarEstadoDto } from "./dto/actualizar-estado.dto";
import { ActualizarInscripcionDto } from "./dto/actualizar-inscripcion.dto";
import { VerificarInscripcionDto } from "./dto/verificar-inscripcion.dto";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { UsuarioAutenticado } from "../auth/jwt-payload";
import { alcanceDe } from "./alcance-inscripciones";

@ApiTags("Inscripciones")
@Controller("inscripciones")
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Post()
  @ApiOperation({
    summary: "Registrar una nueva postulación (Anexo 1) como Cantante o Grupo",
  })
  crear(@Body() dto: CrearInscripcionDto) {
    return this.inscripcionesService.crear(dto);
  }

  // POST (no GET con query) para que el C.I. no quede en la URL ni en logs
  // de acceso; límite bajo para que no se pueda barrer carnets por fuerza bruta.
  @Post("verificar")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary:
      "Verificar si un C.I. tiene una postulación (inscrito / rechazado / no inscrito), sin exponer otros datos",
  })
  verificar(@Body() dto: VerificarInscripcionDto) {
    return this.inscripcionesService.verificar(dto.ciNumero);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Listar postulaciones (cantantes y grupos) — panel de administración. Un USER solo recibe las de su departamento",
  })
  listar(
    @CurrentUser() usuario: UsuarioAutenticado,
    @Query("estado") estado?: EstadoInscripcion,
  ) {
    return this.inscripcionesService.listarPendientes(
      estado,
      alcanceDe(usuario),
    );
  }

  @Get(":tipo/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Obtener el detalle completo de una postulación — panel de administración (un USER solo las de su departamento)",
  })
  obtenerUno(
    @CurrentUser() usuario: UsuarioAutenticado,
    @Param("tipo") tipo: string,
    @Param("id") id: string,
  ) {
    return this.inscripcionesService.obtenerUno(tipo, id, alcanceDe(usuario));
  }

  @Patch(":tipo/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Editar los datos de una postulación — panel de administración",
  })
  actualizar(
    @Param("tipo") tipo: string,
    @Param("id") id: string,
    @Body() dto: ActualizarInscripcionDto,
  ) {
    return this.inscripcionesService.actualizar(tipo, id, dto);
  }

  @Delete(":tipo/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Eliminar definitivamente una postulación (con sus integrantes, acompañantes y canciones de Ñusta) — solo ADMIN",
  })
  eliminar(@Param("tipo") tipo: string, @Param("id") id: string) {
    return this.inscripcionesService.eliminar(tipo, id);
  }

  @Patch(":tipo/:id/estado")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Cambiar el estado de una postulación (sin confirmar / preselección / participante final / rechazado). Un USER solo en las de su departamento",
  })
  actualizarEstado(
    @CurrentUser() usuario: UsuarioAutenticado,
    @Param("tipo") tipo: string,
    @Param("id") id: string,
    @Body() dto: ActualizarEstadoDto,
  ) {
    return this.inscripcionesService.actualizarEstado(
      tipo,
      id,
      dto.estado,
      alcanceDe(usuario),
    );
  }

  @Post(":tipo/:id/fotos")
  @ApiOperation({
    summary:
      "Subir fotos del carnet de identidad (anverso/reverso, por persona o el archivo grupal de carnets)",
  })
  @UseInterceptors(
    FilesInterceptor("fotos", 25, {
      limits: { fileSize: LIMITE_ARCHIVO_BYTES },
      fileFilter: (_req, file, callback) => {
        callback(null, MIME_TYPES_PERMITIDOS.includes(file.mimetype));
      },
    }),
  )
  async subirFotos(
    @Param("tipo") tipo: string,
    @Param("id") id: string,
    @UploadedFiles()
    fotos: Array<{ buffer: Buffer; mimetype: string; originalname: string }>,
    @Body("objetivos") objetivosRaw: string,
  ) {
    let objetivosCrudos: unknown;
    try {
      objetivosCrudos = JSON.parse(objetivosRaw ?? "[]");
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
        throw new BadRequestException(
          `Objetivo de foto inválido: ${errores.map((e) => e.toString()).join("; ")}`,
        );
      }
    }

    return this.inscripcionesService.subirFotos(
      tipo,
      id,
      fotos ?? [],
      objetivos,
    );
  }

  @Post(":tipo/:id/plan-promocion")
  @ApiOperation({
    summary:
      'PDF del plan de promoción del festival (solo categoría "Ñusta")',
  })
  @UseInterceptors(
    FileInterceptor("archivo", {
      limits: { fileSize: LIMITE_ARCHIVO_BYTES },
      fileFilter: (_req, file, callback) => {
        callback(null, file.mimetype === "application/pdf");
      },
    }),
  )
  async subirPlanPromocion(
    @Param("tipo") tipo: string,
    @Param("id") id: string,
    @UploadedFile()
    archivo: { buffer: Buffer; mimetype: string; originalname: string },
  ) {
    if (!archivo) {
      throw new BadRequestException(
        'Falta el archivo ("archivo") o no es un PDF',
      );
    }
    return this.inscripcionesService.subirPlanPromocion(tipo, id, archivo);
  }
}

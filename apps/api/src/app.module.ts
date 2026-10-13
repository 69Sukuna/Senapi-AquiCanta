import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { CategoriasModule } from "./categorias/categorias.module";
import { CantantesModule } from "./cantantes/cantantes.module";
import { GruposModule } from "./grupos/grupos.module";
import { InscripcionesModule } from "./inscripciones/inscripciones.module";
import { SellosModule } from "./sellos/sellos.module";
import { StorageModule } from "./storage/storage.module";
import { ConfiguracionVistaModule } from "./configuracion-vista/configuracion-vista.module";
import { AuthModule } from "./auth/auth.module";
import { VisitantesModule } from "./visitantes/visitantes.module";
import { UsuariosModule } from "./usuarios/usuarios.module";
import { ListaNiustaModule } from "./lista-niusta/lista-niusta.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Límite global por IP (120 req/min) — no existía ninguna protección de
    // este tipo antes; rutas puntuales (login con Google, vincular sellos)
    // se endurecen aparte con @Throttle() en su propio controller.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    StorageModule,
    AuthModule,
    VisitantesModule,
    CategoriasModule,
    CantantesModule,
    GruposModule,
    InscripcionesModule,
    SellosModule,
    ConfiguracionVistaModule,
    UsuariosModule,
    ListaNiustaModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

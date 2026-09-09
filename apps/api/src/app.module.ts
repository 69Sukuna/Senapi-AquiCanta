import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    CategoriasModule,
    CantantesModule,
    GruposModule,
    InscripcionesModule,
    SellosModule,
    ConfiguracionVistaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

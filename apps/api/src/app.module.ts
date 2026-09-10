import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriasModule } from './categorias/categorias.module';
import { CantantesModule } from './cantantes/cantantes.module';
import { GruposModule } from './grupos/grupos.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StorageModule,
    CategoriasModule,
    CantantesModule,
    GruposModule,
    InscripcionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

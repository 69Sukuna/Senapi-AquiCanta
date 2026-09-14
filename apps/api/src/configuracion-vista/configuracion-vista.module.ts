import { Module } from '@nestjs/common';
import { ConfiguracionVistaController } from './configuracion-vista.controller';
import { ConfiguracionVistaService } from './configuracion-vista.service';

@Module({
  controllers: [ConfiguracionVistaController],
  providers: [ConfiguracionVistaService],
})
export class ConfiguracionVistaModule {}

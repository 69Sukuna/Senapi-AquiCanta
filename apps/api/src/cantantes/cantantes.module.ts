import { Module } from '@nestjs/common';
import { CantantesController } from './cantantes.controller';
import { CantantesService } from './cantantes.service';

@Module({
  controllers: [CantantesController],
  providers: [CantantesService],
})
export class CantantesModule {}

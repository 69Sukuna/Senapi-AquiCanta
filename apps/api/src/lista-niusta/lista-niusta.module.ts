import { Module } from '@nestjs/common';
import { ListaNiustaController } from './lista-niusta.controller';
import { ListaNiustaService } from './lista-niusta.service';

@Module({
  controllers: [ListaNiustaController],
  providers: [ListaNiustaService],
})
export class ListaNiustaModule {}

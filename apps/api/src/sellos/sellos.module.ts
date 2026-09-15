import { Module } from '@nestjs/common';
import { SellosController } from './sellos.controller';
import { SellosAdminController } from './sellos-admin.controller';
import { SellosService } from './sellos.service';

@Module({
  controllers: [SellosController, SellosAdminController],
  providers: [SellosService],
})
export class SellosModule {}

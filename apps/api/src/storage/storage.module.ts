import { Global, Module } from '@nestjs/common';
import { STORAGE_SERVICE } from './storage.interface';
import { LocalDiskStorageService } from './local-disk-storage.service';

// Única línea que cambia el día que se elija un proveedor real (S3/R2/
// Supabase): reemplazar `useClass: LocalDiskStorageService` por la nueva
// implementación — el resto del código (controllers, services, frontend)
// no necesita tocarse porque todo depende de STORAGE_SERVICE, no de esta
// clase concreta.
@Global()
@Module({
  providers: [{ provide: STORAGE_SERVICE, useClass: LocalDiskStorageService }],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}

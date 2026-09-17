import { Global, Module } from '@nestjs/common';
import { STORAGE_SERVICE } from './storage.interface';
import { CloudinaryStorageService } from './cloudinary-storage.service';

// Proveedor real de almacenamiento: Cloudinary. LocalDiskStorageService
// (disco local) queda en el repo para desarrollo sin credenciales, pero ya
// no está enchufado acá — para volver a usarlo, cambiar `useClass` de
// vuelta. El resto del código (controllers, services, frontend) no
// necesita tocarse porque todo depende de STORAGE_SERVICE, no de esta
// clase concreta.
@Global()
@Module({
  providers: [{ provide: STORAGE_SERVICE, useClass: CloudinaryStorageService }],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}

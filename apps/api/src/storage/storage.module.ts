import { Global, Module } from '@nestjs/common';
import { STORAGE_SERVICE } from './storage.interface';
import { CloudinaryStorageService } from './cloudinary-storage.service';
import { LocalDiskStorageService } from './local-disk-storage.service';

// Cloudinary cuando hay credenciales reales en el entorno; si faltan (o siguen
// con el placeholder de .env.example) cae a disco local, para poder probar el
// proyecto sin ninguna cuenta externa. El resto del código solo depende de
// STORAGE_SERVICE, así que no necesita saber cuál quedó activo.
const esValor = (v?: string) => !!v && v.trim() !== '' && !v.startsWith('reemplaza-');

export const hayCredencialesCloudinary = () =>
  esValor(process.env.CLOUDINARY_CLOUD_NAME) &&
  esValor(process.env.CLOUDINARY_API_KEY) &&
  esValor(process.env.CLOUDINARY_API_SECRET);

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useFactory: () => {
        if (hayCredencialesCloudinary()) return new CloudinaryStorageService();
        console.warn('[Storage] Sin credenciales de Cloudinary: las fotos se guardan en disco local (/uploads).');
        return new LocalDiskStorageService();
      },
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import type { StorageService } from './storage.interface';

// Implementación real de STORAGE_SERVICE sobre Cloudinary — reemplaza a
// LocalDiskStorageService (ver storage.module.ts, es la única línea que
// cambió). Requiere CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/
// CLOUDINARY_API_SECRET en el .env (panel de Cloudinary → Dashboard).
@Injectable()
export class CloudinaryStorageService implements StorageService, OnModuleInit {
  onModuleInit() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async guardarArchivo(buffer: Buffer, nombreArchivo: string, mimeType: string, carpeta = 'ci'): Promise<string> {
    // Los PDF (carnets grupales en bloque, plan de promoción de Ñusta) no
    // son "imágenes" para Cloudinary — necesitan resource_type "raw"; las
    // fotos de anverso/reverso van como "image".
    const resourceType = mimeType === 'application/pdf' ? 'raw' : 'image';

    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `aquicantabolivia/${carpeta}`,
          public_id: randomUUID(),
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error(`Cloudinary no devolvió resultado al subir ${nombreArchivo}`));
            return;
          }
          resolve(result.secure_url);
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }
}

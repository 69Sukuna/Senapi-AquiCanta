import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { StorageService } from './storage.interface';

// Implementación por defecto — guarda en disco local, bajo apps/api/uploads/ci.
// Sirve para desarrollar/probar sin depender de una cuenta en la nube todavía.
// No pensada para producción real con múltiples instancias (el disco no se
// comparte entre contenedores) — el día que se elija S3/R2/Supabase, esta
// clase se reemplaza sin tocar nada más (ver storage.module.ts).
const CARPETA_UPLOADS = join(process.cwd(), 'uploads', 'ci');

@Injectable()
export class LocalDiskStorageService implements StorageService, OnModuleInit {
  async onModuleInit() {
    if (!existsSync(CARPETA_UPLOADS)) {
      await mkdir(CARPETA_UPLOADS, { recursive: true });
    }
  }

  async guardarArchivo(buffer: Buffer, nombreArchivo: string, mimeType: string): Promise<string> {
    const extension = mimeType === 'application/pdf' ? 'pdf' : (nombreArchivo.split('.').pop() ?? 'jpg');
    const nombreFinal = `${randomUUID()}.${extension}`;
    await writeFile(join(CARPETA_UPLOADS, nombreFinal), buffer);

    const baseUrl = process.env.API_PUBLIC_URL || 'http://localhost:4000';
    return `${baseUrl}/uploads/ci/${nombreFinal}`;
  }
}

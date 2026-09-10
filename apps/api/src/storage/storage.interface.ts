// Abstracción de almacenamiento de archivos — hoy no se sabe qué proveedor
// en la nube se va a usar (S3 / R2 / Supabase), así que el resto del código
// solo depende de esta interfaz. El día que se elija un proveedor real,
// alcanza con agregar una nueva implementación y cambiar el `useClass` en
// storage.module.ts — nada más debería tocarse.
export interface StorageService {
  guardarArchivo(buffer: Buffer, nombreArchivo: string, mimeType: string): Promise<string>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

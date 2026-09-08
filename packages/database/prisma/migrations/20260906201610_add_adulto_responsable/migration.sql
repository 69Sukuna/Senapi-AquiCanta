-- AlterTable
ALTER TABLE "cantantes" ADD COLUMN     "adultoResponsableCiExtension" TEXT,
ADD COLUMN     "adultoResponsableCiNumero" TEXT,
ADD COLUMN     "adultoResponsableNombre" TEXT;

-- AlterTable
ALTER TABLE "categorias" ADD COLUMN     "requiereAdultoResponsable" BOOLEAN NOT NULL DEFAULT false;

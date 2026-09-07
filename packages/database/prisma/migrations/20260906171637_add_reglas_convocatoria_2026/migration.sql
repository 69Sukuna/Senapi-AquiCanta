/*
  Warnings:

  - You are about to drop the column `edad` on the `cantantes` table. All the data in the column will be lost.
  - You are about to drop the column `esGrupal` on the `categorias` table. All the data in the column will be lost.
  - You are about to drop the column `edad` on the `grupo_integrantes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cantantes" DROP COLUMN "edad",
ADD COLUMN     "fechaNacimiento" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "categorias" DROP COLUMN "esGrupal",
ADD COLUMN     "acompanantesMax" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "edadMaxima" INTEGER,
ADD COLUMN     "edadMinima" INTEGER,
ADD COLUMN     "integrantesMax" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "integrantesMin" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "grupo_integrantes" DROP COLUMN "edad",
ADD COLUMN     "fechaNacimiento" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "acompanantes" (
    "id" TEXT NOT NULL,
    "cantanteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciNumero" TEXT,
    "ciExtension" TEXT,
    "instrumento" TEXT,

    CONSTRAINT "acompanantes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "acompanantes" ADD CONSTRAINT "acompanantes_cantanteId_fkey" FOREIGN KEY ("cantanteId") REFERENCES "cantantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

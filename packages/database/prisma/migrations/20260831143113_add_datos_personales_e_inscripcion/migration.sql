/*
  Warnings:

  - Added the required column `updatedAt` to the `cantantes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `grupos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "cantantes" ADD COLUMN     "aceptaBases" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "celular1" TEXT,
ADD COLUMN     "celular2" TEXT,
ADD COLUMN     "ciExtension" TEXT,
ADD COLUMN     "ciNumero" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "declaracionVoluntaria" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "edad" TEXT,
ADD COLUMN     "estado" "EstadoInscripcion" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "categorias" ADD COLUMN     "esGrupal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "grupo_integrantes" ADD COLUMN     "ciExtension" TEXT,
ADD COLUMN     "ciNumero" TEXT,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "edad" TEXT,
ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "grupos" ADD COLUMN     "aceptaBases" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "celular1" TEXT,
ADD COLUMN     "celular2" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "declaracionVoluntaria" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estado" "EstadoInscripcion" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

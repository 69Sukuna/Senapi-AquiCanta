-- CreateEnum
CREATE TYPE "Departamento" AS ENUM ('LA_PAZ', 'COCHABAMBA', 'SANTA_CRUZ', 'ORURO', 'POTOSI', 'CHUQUISACA', 'TARIJA', 'BENI', 'PANDO');

-- AlterTable
ALTER TABLE "cantantes" ADD COLUMN     "autorCompositor" TEXT,
ADD COLUMN     "departamento" "Departamento",
ADD COLUMN     "pseudonimo" TEXT,
ADD COLUMN     "ritmo" TEXT,
ADD COLUMN     "tiempo" TEXT,
ADD COLUMN     "tituloTema" TEXT;

-- AlterTable
ALTER TABLE "grupos" ADD COLUMN     "autorCompositor" TEXT,
ADD COLUMN     "departamento" "Departamento",
ADD COLUMN     "pseudonimo" TEXT,
ADD COLUMN     "ritmo" TEXT,
ADD COLUMN     "tiempo" TEXT,
ADD COLUMN     "tituloTema" TEXT;

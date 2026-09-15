-- DropForeignKey
ALTER TABLE "medallas" DROP CONSTRAINT "medallas_trayectoId_fkey";

-- AlterTable
ALTER TABLE "medallas" DROP COLUMN "trayectoId";

-- AlterTable
ALTER TABLE "trayectos" DROP COLUMN "principal";

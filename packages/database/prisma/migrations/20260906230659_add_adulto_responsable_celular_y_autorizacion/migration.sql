-- AlterTable
ALTER TABLE "cantantes" ADD COLUMN     "adultoResponsableCelular" TEXT,
ADD COLUMN     "autorizaParticipacionAdultoResponsable" BOOLEAN NOT NULL DEFAULT false;

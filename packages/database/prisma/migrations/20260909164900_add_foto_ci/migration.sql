-- AlterTable
ALTER TABLE "acompanantes" ADD COLUMN     "fotoCiAnversoUrl" TEXT,
ADD COLUMN     "fotoCiReversoUrl" TEXT;

-- AlterTable
ALTER TABLE "cantantes" ADD COLUMN     "adultoResponsableFotoCiAnversoUrl" TEXT,
ADD COLUMN     "adultoResponsableFotoCiReversoUrl" TEXT,
ADD COLUMN     "fotoCiAnversoUrl" TEXT,
ADD COLUMN     "fotoCiReversoUrl" TEXT;

-- AlterTable
ALTER TABLE "grupo_integrantes" ADD COLUMN     "fotoCiAnversoUrl" TEXT,
ADD COLUMN     "fotoCiReversoUrl" TEXT;

-- AlterTable
ALTER TABLE "grupos" ADD COLUMN     "fotosCarnetsGrupalUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

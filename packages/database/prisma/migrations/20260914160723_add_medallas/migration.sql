-- CreateTable
CREATE TABLE "medallas" (
    "id" TEXT NOT NULL,
    "trayectoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "umbral" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "medallas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medallas" ADD CONSTRAINT "medallas_trayectoId_fkey" FOREIGN KEY ("trayectoId") REFERENCES "trayectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

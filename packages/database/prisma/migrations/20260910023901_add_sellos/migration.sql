-- CreateTable
CREATE TABLE "trayectos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagenUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trayectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "trayectoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "imagenUrl" TEXT,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_escaneo" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "instancia" TEXT,
    "nombre" TEXT,
    "codigo" TEXT NOT NULL,
    "imagenUrl" TEXT,

    CONSTRAINT "puntos_escaneo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escaneos_punto" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "puntoId" TEXT NOT NULL,
    "escaneadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escaneos_punto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rangos" (
    "id" TEXT NOT NULL,
    "trayectoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rangos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventoToRango" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventoToRango_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "puntos_escaneo_codigo_key" ON "puntos_escaneo"("codigo");

-- CreateIndex
CREATE INDEX "escaneos_punto_visitorId_idx" ON "escaneos_punto"("visitorId");

-- CreateIndex
CREATE UNIQUE INDEX "escaneos_punto_visitorId_puntoId_key" ON "escaneos_punto"("visitorId", "puntoId");

-- CreateIndex
CREATE INDEX "_EventoToRango_B_index" ON "_EventoToRango"("B");

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_trayectoId_fkey" FOREIGN KEY ("trayectoId") REFERENCES "trayectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_escaneo" ADD CONSTRAINT "puntos_escaneo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escaneos_punto" ADD CONSTRAINT "escaneos_punto_puntoId_fkey" FOREIGN KEY ("puntoId") REFERENCES "puntos_escaneo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rangos" ADD CONSTRAINT "rangos_trayectoId_fkey" FOREIGN KEY ("trayectoId") REFERENCES "trayectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToRango" ADD CONSTRAINT "_EventoToRango_A_fkey" FOREIGN KEY ("A") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToRango" ADD CONSTRAINT "_EventoToRango_B_fkey" FOREIGN KEY ("B") REFERENCES "rangos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

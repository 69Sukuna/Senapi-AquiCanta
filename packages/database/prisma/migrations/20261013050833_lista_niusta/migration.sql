-- CreateTable
CREATE TABLE "lista_niusta" (
    "id" TEXT NOT NULL,
    "cantanteId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "tituloTema" TEXT NOT NULL,
    "autorCompositor" TEXT NOT NULL,
    "ritmo" TEXT NOT NULL,
    "tiempo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lista_niusta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lista_niusta_cantanteId_orden_key" ON "lista_niusta"("cantanteId", "orden");

-- AddForeignKey
ALTER TABLE "lista_niusta" ADD CONSTRAINT "lista_niusta_cantanteId_fkey" FOREIGN KEY ("cantanteId") REFERENCES "cantantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

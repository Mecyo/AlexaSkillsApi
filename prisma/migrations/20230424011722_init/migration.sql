-- CreateTable
CREATE TABLE "punishments" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "punished_name" TEXT NOT NULL,
    "qtt_days" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "punishments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teste" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Teste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "punishments_punished_name_key" ON "punishments"("punished_name");

/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Proponente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Proponente" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Proponente_userId_key" ON "Proponente"("userId");

-- AddForeignKey
ALTER TABLE "Proponente" ADD CONSTRAINT "Proponente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

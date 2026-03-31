/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `LegalInstrument` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[legalInstrumentId,revisionKey]` on the table `LegalInstrumentVersion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fieldsJson` to the `LegalInstrument` table without a default value. This is not possible if the table is not empty.
  - The required column `revisionKey` was added to the `LegalInstrument` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `templateFileId` to the `LegalInstrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `LegalInstrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionKey` to the `LegalInstrumentVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LegalInstrument" ADD COLUMN     "fieldsJson" JSONB NOT NULL,
ADD COLUMN     "revisionKey" TEXT NOT NULL,
ADD COLUMN     "templateFileId" TEXT NOT NULL,
ADD COLUMN     "type" "LegalInstrumentType" NOT NULL;

-- AlterTable
ALTER TABLE "LegalInstrumentVersion" ADD COLUMN     "revisionKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LegalInstrument_type_key" ON "LegalInstrument"("type");

-- CreateIndex
CREATE UNIQUE INDEX "LegalInstrumentVersion_legalInstrumentId_revisionKey_key" ON "LegalInstrumentVersion"("legalInstrumentId", "revisionKey");

-- AddForeignKey
ALTER TABLE "LegalInstrument" ADD CONSTRAINT "LegalInstrument_templateFileId_fkey" FOREIGN KEY ("templateFileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

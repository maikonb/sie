/*
  Warnings:

  - You are about to drop the column `fieldsJson` on the `LegalInstrument` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `LegalInstrument` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `LegalInstrument` table. All the data in the column will be lost.
  - You are about to drop the column `answerFileId` on the `LegalInstrumentInstance` table. All the data in the column will be lost.
  - You are about to drop the column `fieldsJson` on the `LegalInstrumentInstance` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `LegalInstrumentInstance` table. All the data in the column will be lost.
  - You are about to drop the column `project_classification_answers` on the `LegalInstrumentInstance` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `LegalInstrumentInstance` table. All the data in the column will be lost.
  - You are about to drop the `ProjectLegalInstrument` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectId]` on the table `LegalInstrumentInstance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `legalInstrumentVersionId` to the `LegalInstrumentInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `LegalInstrumentInstance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LegalInstrument" DROP CONSTRAINT "LegalInstrument_fileId_fkey";

-- DropForeignKey
ALTER TABLE "LegalInstrumentInstance" DROP CONSTRAINT "LegalInstrumentInstance_answerFileId_fkey";

-- DropForeignKey
ALTER TABLE "LegalInstrumentInstance" DROP CONSTRAINT "LegalInstrumentInstance_fileId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectLegalInstrument" DROP CONSTRAINT "ProjectLegalInstrument_legalInstrumentId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectLegalInstrument" DROP CONSTRAINT "ProjectLegalInstrument_legalInstrumentInstanceId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectLegalInstrument" DROP CONSTRAINT "ProjectLegalInstrument_projectId_fkey";

-- AlterTable
ALTER TABLE "LegalInstrument" DROP COLUMN "fieldsJson",
DROP COLUMN "fileId",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "LegalInstrumentInstance" DROP COLUMN "answerFileId",
DROP COLUMN "fieldsJson",
DROP COLUMN "fileId",
DROP COLUMN "project_classification_answers",
DROP COLUMN "type",
ADD COLUMN     "filledFileId" TEXT,
ADD COLUMN     "legalInstrumentVersionId" TEXT NOT NULL,
ADD COLUMN     "projectClassificationAnswers" JSONB,
ADD COLUMN     "projectId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ProjectLegalInstrument";

-- CreateTable
CREATE TABLE "LegalInstrumentVersion" (
    "id" TEXT NOT NULL,
    "legalInstrumentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "type" "LegalInstrumentType" NOT NULL,
    "fieldsJson" JSONB NOT NULL,
    "templateFileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalInstrumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LegalInstrumentVersion_legalInstrumentId_idx" ON "LegalInstrumentVersion"("legalInstrumentId");

-- CreateIndex
CREATE INDEX "LegalInstrumentVersion_type_idx" ON "LegalInstrumentVersion"("type");

-- CreateIndex
CREATE UNIQUE INDEX "LegalInstrumentVersion_legalInstrumentId_version_key" ON "LegalInstrumentVersion"("legalInstrumentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "LegalInstrumentInstance_projectId_key" ON "LegalInstrumentInstance"("projectId");

-- CreateIndex
CREATE INDEX "LegalInstrumentInstance_legalInstrumentVersionId_idx" ON "LegalInstrumentInstance"("legalInstrumentVersionId");

-- CreateIndex
CREATE INDEX "LegalInstrumentInstance_status_idx" ON "LegalInstrumentInstance"("status");

-- AddForeignKey
ALTER TABLE "LegalInstrumentVersion" ADD CONSTRAINT "LegalInstrumentVersion_legalInstrumentId_fkey" FOREIGN KEY ("legalInstrumentId") REFERENCES "LegalInstrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalInstrumentVersion" ADD CONSTRAINT "LegalInstrumentVersion_templateFileId_fkey" FOREIGN KEY ("templateFileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalInstrumentInstance" ADD CONSTRAINT "LegalInstrumentInstance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalInstrumentInstance" ADD CONSTRAINT "LegalInstrumentInstance_legalInstrumentVersionId_fkey" FOREIGN KEY ("legalInstrumentVersionId") REFERENCES "LegalInstrumentVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalInstrumentInstance" ADD CONSTRAINT "LegalInstrumentInstance_filledFileId_fkey" FOREIGN KEY ("filledFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

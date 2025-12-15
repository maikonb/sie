-- AlterTable
ALTER TABLE "LegalInstrumentInstance" ADD COLUMN     "answerFileId" TEXT;

-- AddForeignKey
ALTER TABLE "LegalInstrumentInstance" ADD CONSTRAINT "LegalInstrumentInstance_answerFileId_fkey" FOREIGN KEY ("answerFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

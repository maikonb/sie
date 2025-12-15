-- CreateEnum
CREATE TYPE "LegalInstrumentStatus" AS ENUM ('DRAFT', 'SENT_FOR_ANALYSIS', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "LegalInstrumentInstance" ADD COLUMN     "status" "LegalInstrumentStatus" NOT NULL DEFAULT 'DRAFT';

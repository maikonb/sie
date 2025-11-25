-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('PDI_AGREEMENT', 'SERVICE_CONTRACT', 'APPDI_PRIVATE', 'APPDI_NO_FUNDING', 'COOP_AGREEMENT', 'NDA', 'TECH_TRANSFER', 'REVIEW_SCOPE');

-- CreateTable
CREATE TABLE "ProjectPartnership" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "type" "PartnershipType" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPartnership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectPartnership_projectId_idx" ON "ProjectPartnership"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectPartnership" ADD CONSTRAINT "ProjectPartnership_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - Changed the type of `referenceTable` on the `ResourceMembers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ResourceMembersType" AS ENUM ('Project');

-- AlterTable
ALTER TABLE "ResourceMembers" DROP COLUMN "referenceTable",
ADD COLUMN     "referenceTable" "ResourceMembersType" NOT NULL;

-- CreateIndex
CREATE INDEX "ResourceMembers_referenceTable_referenceId_idx" ON "ResourceMembers"("referenceTable", "referenceId");

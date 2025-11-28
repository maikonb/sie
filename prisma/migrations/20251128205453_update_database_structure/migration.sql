/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CronogramaItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EquipeItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participante` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanoTrabalho` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Projeto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proponente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Responsabilidade` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AdministrativeSphere" AS ENUM ('FEDERAL', 'STATE', 'MUNICIPAL', 'PRIVATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ApprovalSector" AS ENUM ('TECHNICAL', 'LEGAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('PDI_AGREEMENT', 'SERVICE_CONTRACT', 'APPDI_PRIVATE', 'APPDI_NO_FUNDING', 'COOP_AGREEMENT', 'NDA', 'TECH_TRANSFER', 'REVIEW_SCOPE');

-- DropForeignKey
ALTER TABLE "CronogramaItem" DROP CONSTRAINT "CronogramaItem_planoTrabalhoId_fkey";

-- DropForeignKey
ALTER TABLE "EquipeItem" DROP CONSTRAINT "EquipeItem_planoTrabalhoId_fkey";

-- DropForeignKey
ALTER TABLE "Participante" DROP CONSTRAINT "Participante_planoTrabalhoId_fkey";

-- DropForeignKey
ALTER TABLE "PlanoTrabalho" DROP CONSTRAINT "PlanoTrabalho_projetoId_fkey";

-- DropForeignKey
ALTER TABLE "Projeto" DROP CONSTRAINT "Projeto_proponenteId_fkey";

-- DropForeignKey
ALTER TABLE "Proponente" DROP CONSTRAINT "Proponente_userId_fkey";

-- DropForeignKey
ALTER TABLE "Responsabilidade" DROP CONSTRAINT "Responsabilidade_participanteId_fkey";

-- DropForeignKey
ALTER TABLE "Responsabilidade" DROP CONSTRAINT "Responsabilidade_planoTrabalhoId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "firstAccess" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "imageId" TEXT;

-- DropTable
DROP TABLE "CronogramaItem";

-- DropTable
DROP TABLE "EquipeItem";

-- DropTable
DROP TABLE "Participante";

-- DropTable
DROP TABLE "PlanoTrabalho";

-- DropTable
DROP TABLE "Projeto";

-- DropTable
DROP TABLE "Proponente";

-- DropTable
DROP TABLE "Responsabilidade";

-- DropEnum
DROP TYPE "EsferaAdministrativa";

-- DropEnum
DROP TYPE "SetorAprovacao";

-- DropEnum
DROP TYPE "SituacaoCronograma";

-- CreateTable
CREATE TABLE "Proponent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "institution" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "proponentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkPlan" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "object" TEXT,
    "diagnosis" TEXT,
    "planScope" TEXT,
    "planJustification" TEXT,
    "generalObjective" TEXT NOT NULL,
    "specificObjectives" JSONB,
    "methodology" TEXT,
    "responsibleUnit" TEXT,
    "ictManager" TEXT,
    "partnerManager" TEXT,
    "monitoring" TEXT,
    "expectedResults" TEXT,
    "validityStart" TIMESTAMP(3),
    "validityEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleItem" (
    "id" SERIAL NOT NULL,
    "workPlanId" INTEGER NOT NULL,
    "axisGoal" TEXT NOT NULL,
    "actionStep" TEXT NOT NULL,
    "indicator" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PLANNED',

    CONSTRAINT "ScheduleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "workPlanId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "titrationArea" TEXT,
    "institution" TEXT,
    "role" TEXT,
    "weeklyHours" INTEGER,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "workPlanId" INTEGER NOT NULL,
    "entityOrg" TEXT NOT NULL,
    "cnpj" TEXT,
    "sphere" "AdministrativeSphere",
    "address" TEXT,
    "authorityName" TEXT,
    "authorityRole" TEXT,
    "authorityDoc" TEXT,
    "contact" TEXT,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Responsibility" (
    "id" SERIAL NOT NULL,
    "workPlanId" INTEGER NOT NULL,
    "participantId" INTEGER,
    "description" TEXT NOT NULL,

    CONSTRAINT "Responsibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Proponent_email_key" ON "Proponent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Proponent_userId_key" ON "Proponent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_proponentId_idx" ON "Project"("proponentId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkPlan_projectId_key" ON "WorkPlan"("projectId");

-- CreateIndex
CREATE INDEX "ScheduleItem_workPlanId_idx" ON "ScheduleItem"("workPlanId");

-- CreateIndex
CREATE INDEX "TeamMember_workPlanId_idx" ON "TeamMember"("workPlanId");

-- CreateIndex
CREATE INDEX "Participant_workPlanId_idx" ON "Participant"("workPlanId");

-- CreateIndex
CREATE INDEX "Responsibility_workPlanId_idx" ON "Responsibility"("workPlanId");

-- CreateIndex
CREATE INDEX "Responsibility_participantId_idx" ON "Responsibility"("participantId");

-- CreateIndex
CREATE INDEX "ProjectPartnership_projectId_idx" ON "ProjectPartnership"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "User_imageId_key" ON "User"("imageId");

-- AddForeignKey
ALTER TABLE "Proponent" ADD CONSTRAINT "Proponent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_proponentId_fkey" FOREIGN KEY ("proponentId") REFERENCES "Proponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkPlan" ADD CONSTRAINT "WorkPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItem" ADD CONSTRAINT "ScheduleItem_workPlanId_fkey" FOREIGN KEY ("workPlanId") REFERENCES "WorkPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_workPlanId_fkey" FOREIGN KEY ("workPlanId") REFERENCES "WorkPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_workPlanId_fkey" FOREIGN KEY ("workPlanId") REFERENCES "WorkPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsibility" ADD CONSTRAINT "Responsibility_workPlanId_fkey" FOREIGN KEY ("workPlanId") REFERENCES "WorkPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsibility" ADD CONSTRAINT "Responsibility_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPartnership" ADD CONSTRAINT "ProjectPartnership_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

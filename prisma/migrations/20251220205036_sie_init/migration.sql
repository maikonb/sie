-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AdministrativeSphere" AS ENUM ('FEDERAL', 'STATE', 'MUNICIPAL', 'PRIVATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ApprovalSector" AS ENUM ('TECHNICAL', 'LEGAL', 'OTHER');

-- CreateEnum
CREATE TYPE "LegalInstrumentType" AS ENUM ('PDI_AGREEMENT', 'SERVICE_CONTRACT', 'APPDI_PRIVATE', 'APPDI_NO_FUNDING', 'COOP_AGREEMENT', 'NDA', 'TECH_TRANSFER', 'REVIEW_SCOPE');

-- CreateEnum
CREATE TYPE "SystemDefaultType" AS ENUM ('Role');

-- CreateEnum
CREATE TYPE "ResourceMembersType" AS ENUM ('Project');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'IN_ANALYSIS', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LegalInstrumentStatus" AS ENUM ('DRAFT', 'SENT_FOR_ANALYSIS', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkPlan" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL,
    "workPlanId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL,
    "workPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "titrationArea" TEXT,
    "institution" TEXT,
    "role" TEXT,
    "weeklyHours" INTEGER,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "workPlanId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL,
    "workPlanId" TEXT NOT NULL,
    "participantId" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Responsibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "imageId" TEXT,
    "color" TEXT,
    "institution" TEXT,
    "firstAccess" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalInstrument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fieldsJson" JSONB NOT NULL,
    "type" "LegalInstrumentType" NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalInstrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalInstrumentInstance" (
    "id" TEXT NOT NULL,
    "fieldsJson" JSONB NOT NULL,
    "type" "LegalInstrumentType" NOT NULL,
    "answers" JSONB,
    "project_classification_answers" JSONB,
    "status" "LegalInstrumentStatus" NOT NULL DEFAULT 'DRAFT',
    "fileId" TEXT NOT NULL,
    "answerFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalInstrumentInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLegalInstrument" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "legalInstrumentId" TEXT NOT NULL,
    "legalInstrumentInstanceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectLegalInstrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceMembers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "referenceTable" "ResourceMembersType" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceMembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemDefaults" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "referenceTable" "SystemDefaultType",
    "referenceId" TEXT,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemDefaults_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_imageId_key" ON "User"("imageId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "OtpCode_email_idx" ON "OtpCode"("email");

-- CreateIndex
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectLegalInstrument_projectId_key" ON "ProjectLegalInstrument"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectLegalInstrument_legalInstrumentInstanceId_key" ON "ProjectLegalInstrument"("legalInstrumentInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_slug_key" ON "Permission"("slug");

-- CreateIndex
CREATE INDEX "ResourceMembers_userId_permissionId_idx" ON "ResourceMembers"("userId", "permissionId");

-- CreateIndex
CREATE INDEX "ResourceMembers_referenceTable_referenceId_idx" ON "ResourceMembers"("referenceTable", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceMembers_userId_permissionId_referenceId_key" ON "ResourceMembers"("userId", "permissionId", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemDefaults_slug_key" ON "SystemDefaults"("slug");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalInstrument" ADD CONSTRAINT "LegalInstrument_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalInstrumentInstance" ADD CONSTRAINT "LegalInstrumentInstance_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalInstrumentInstance" ADD CONSTRAINT "LegalInstrumentInstance_answerFileId_fkey" FOREIGN KEY ("answerFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLegalInstrument" ADD CONSTRAINT "ProjectLegalInstrument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLegalInstrument" ADD CONSTRAINT "ProjectLegalInstrument_legalInstrumentId_fkey" FOREIGN KEY ("legalInstrumentId") REFERENCES "LegalInstrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLegalInstrument" ADD CONSTRAINT "ProjectLegalInstrument_legalInstrumentInstanceId_fkey" FOREIGN KEY ("legalInstrumentInstanceId") REFERENCES "LegalInstrumentInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceMembers" ADD CONSTRAINT "ResourceMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceMembers" ADD CONSTRAINT "ResourceMembers_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

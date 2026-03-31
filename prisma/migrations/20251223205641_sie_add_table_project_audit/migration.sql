-- CreateTable
CREATE TABLE "ProjectAudit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changeDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectAudit_projectId_idx" ON "ProjectAudit"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectAudit" ADD CONSTRAINT "ProjectAudit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAudit" ADD CONSTRAINT "ProjectAudit_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

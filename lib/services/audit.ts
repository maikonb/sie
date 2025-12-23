import { prisma } from "@/lib/config/db"

export type ProjectAction = "CREATED" | "SUBMITTED" | "REVIEW_STARTED" | "APPROVED" | "REJECTED" | "EDITED"

export async function logProjectAction(projectId: string, action: ProjectAction, changedBy: string, changeDetails?: Record<string, any>) {
  await prisma.projectAudit.create({
    data: {
      projectId,
      action,
      changedBy,
      changeDetails: changeDetails ? (changeDetails as any) : undefined,
    },
  })
}

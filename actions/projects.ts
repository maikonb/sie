"use server"

import { prisma } from "@/lib/config/db"
import { generateUniqueSlug } from "@/lib/utils/slug"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/config/auth"
import { APP_ERRORS } from "@/lib/errors"
import { Prisma, ResourceMembersType } from "@prisma/client"
import PermissionsService from "@/lib/services/permissions"
import { notifyAdminsOfNewSubmission, notifyUserOfApproval, notifyUserOfRejection } from "@/lib/services/email"
import { logProjectAction } from "@/lib/services/audit"

const projectWithRelations = Prisma.validator<Prisma.ProjectDefaultArgs>()({
  include: {
    user: {
      select: {
        name: true,
        email: true,
        color: true,
        imageFile: true,
      },
    },
    legalInstruments: {
      include: {
        legalInstrument: true,
        legalInstrumentInstance: {
          include: {
            answerFile: true,
          },
        },
      },
    },
    workPlan: true,
    audits: {
      include: {
        user: { select: { name: true } },
      },
    },
  },
})

export type getProjectBySlugResponse = Prisma.ProjectGetPayload<typeof projectWithRelations> | null

export async function getProjectBySlug(slug: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const project: getProjectBySlugResponse = await prisma.project.findUnique({
    where: { slug: slug },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          color: true,
          imageFile: true,
        },
      },
      legalInstruments: {
        include: {
          legalInstrument: true,
          legalInstrumentInstance: {
            include: {
              answerFile: true,
            },
          },
        },
      },
      workPlan: true,
      audits: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  })

  if (!project) {
    return null
  }

  if (project.userId == session.user.id) {
    return project
  }

  const canViewResource = await PermissionsService.can(session.user.id, {
    slug: "projects.view",
    referenceTable: ResourceMembersType.Project,
    referenceId: project.id,
  })

  if (canViewResource) {
    return project
  }

  const canApprove = await PermissionsService.can(session.user.id, { slug: "projects.approve" })

  if (canApprove) {
    return project
  }

  return null
}

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Unauthorized")

  await PermissionsService.authorize(session.user.id, { slug: "projects.create" })

  const titulo = String(formData.get("titulo") || "").trim()
  const objetivos = String(formData.get("objetivos") || "").trim()
  const justificativa = String(formData.get("justificativa") || "").trim()
  const abrangencia = String(formData.get("abrangencia") || "").trim()

  if (!titulo || !objetivos || !justificativa || !abrangencia) {
    throw new Error(APP_ERRORS.GENERIC_ERROR.code)
  }

  const slug = await generateUniqueSlug(titulo)

  return prisma.project.create({
    data: {
      title: titulo,
      slug,
      objectives: objetivos,
      justification: justificativa,
      scope: abrangencia,
      userId: session.user.id,
    },
  })
}

export async function createLegalInstrument(slug: string, result: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return { success: false, error: "Unauthorized" }

    const legalInstrument = await prisma.legalInstrument.findFirst({ where: { type: result.type } })
    if (!legalInstrument) return { success: false, error: APP_ERRORS.PROJECT_CREATE_LEGAL_INSTRUMENTS.code }

    const project = await prisma.project.findUnique({ where: { slug: slug }, include: { legalInstruments: true } })
    if (!project) return { success: false, error: APP_ERRORS.PROJECT_CREATE_LEGAL_INSTRUMENTS.code }

    await prisma.$transaction(
      async (prismaTx) => {
        const instance = await prismaTx.legalInstrumentInstance.create({
          data: {
            type: result.type,
            fieldsJson: legalInstrument.fieldsJson as any,
            project_classification_answers: result.history,
            fileId: legalInstrument.fileId,
          },
        })

        await prismaTx.projectLegalInstrument.create({
          data: {
            projectId: project.id,
            legalInstrumentId: legalInstrument.id,
            legalInstrumentInstanceId: instance.id,
          },
        })
      },
      {
        timeout: 10000,
        isolationLevel: "Serializable",
      }
    )

    return { success: true, error: null }
  } catch (error) {
    console.error("Error creating legal instrument:", error)
    return { success: false, error: APP_ERRORS.GENERIC_ERROR.code }
  }
}

export async function getAllProjects() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return []

  const canViewAll = await PermissionsService.can(session.user.id, { slug: "projects.view.all" })

  if (canViewAll) {
    const projects = await prisma.project.findMany({
      include: {
        workPlan: { select: { id: true } },
        legalInstruments: {
          include: {
            legalInstrumentInstance: {
              select: { status: true, type: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return projects
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      workPlan: { select: { id: true } },
      legalInstruments: {
        include: {
          legalInstrumentInstance: {
            select: { status: true, type: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return projects
}

export async function getProjectLegalInstrument(slug: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Unauthorized")

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      legalInstruments: {
        include: {
          legalInstrumentInstance: {
            include: {
              file: true,
            },
          },
        },
      },
    },
  })

  if (!project) return null

  // Since projectId is unique in ProjectLegalInstrument, there is at most one.
  const link = project.legalInstruments[0]
  if (!link) return null

  return link.legalInstrumentInstance
}

export async function updateProject(slug: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Unauthorized")

  const titulo = String(formData.get("titulo") || "").trim()
  const objetivos = String(formData.get("objetivos") || "").trim()
  const justificativa = String(formData.get("justificativa") || "").trim()
  const abrangencia = String(formData.get("abrangencia") || "").trim()

  if (!titulo || !objetivos || !justificativa || !abrangencia) {
    throw new Error(APP_ERRORS.GENERIC_ERROR.code)
  }

  const project = await prisma.project.findUnique({
    where: { slug },
  })

  if (!project) throw new Error("Project not found")
  if (project.userId !== session.user.id) {
    throw new Error("Unauthorized access to project")
  }

  return prisma.project.update({
    where: { slug },
    data: {
      title: titulo,
      objectives: objetivos,
      justification: justificativa,
      scope: abrangencia,
    },
  })
}

export type ProjectViewerContext = {
  mode: "owner" | "resource" | "approver" | "other"
  allowActions: boolean
}

export async function getProjectViewerContext(slug: string): Promise<ProjectViewerContext> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const project = await prisma.project.findUnique({ where: { slug }, select: { id: true, userId: true } })
  if (!project) {
    throw new Error("Project not found")
  }

  const isOwner = project.userId === session.user.id

  const isResourceMember = await prisma.resourceMembers.findFirst({
    where: {
      userId: session.user.id,
      referenceTable: ResourceMembersType.Project,
      referenceId: project.id,
    },
    select: { id: true },
  })

  const canApprove = await PermissionsService.can(session.user.id, { slug: "projects.approve" })

  const mode: ProjectViewerContext["mode"] = isOwner ? "owner" : isResourceMember ? "resource" : canApprove ? "approver" : "other"

  return {
    mode,
    allowActions: isOwner || !!isResourceMember,
  }
}

export async function submitProjectForApproval(slug: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      legalInstruments: {
        include: {
          legalInstrumentInstance: {
            select: { status: true },
          },
        },
      },
      workPlan: true,
    },
  })

  if (!project) throw new Error("Project not found")
  if (project.userId !== session.user.id) {
    throw new Error("Unauthorized - only project creator can submit for approval")
  }

  // Validate that project is in DRAFT status
  if (project.status !== "DRAFT") {
    throw new Error("Project has already been submitted for approval")
  }

  // Validate dependencies
  if (!project.legalInstruments || project.legalInstruments.length === 0) {
    throw new Error("Project must have at least one legal instrument before submission")
  }

  const hasPendingInstruments = project.legalInstruments.some((li) => {
    const status = li.legalInstrumentInstance?.status || "PENDING"
    return status !== "FILLED"
  })

  if (hasPendingInstruments) {
    throw new Error("All legal instruments must be filled before submission")
  }

  if (!project.workPlan) {
    throw new Error("Project must have a work plan before submission")
  }

  const updated = await prisma.project.update({
    where: { slug },
    data: {
      status: "PENDING_REVIEW",
      submittedAt: new Date(),
    },
  })

  // Notify approvers and log audit
  try {
    const full = await prisma.project.findUnique({
      where: { slug },
      include: { user: { select: { name: true } } },
    })
    if (full) {
      await notifyAdminsOfNewSubmission({ id: full.id, title: full.title, slug: full.slug!, user: { name: full.user?.name } })
      await logProjectAction(full.id, "SUBMITTED", session.user.id, { fromStatus: project.status, toStatus: "PENDING_REVIEW" })
    }
  } catch (e) {
    console.error("notify/log submitProjectForApproval error", e)
  }

  return updated
}

export async function startProjectReview(slug: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify reviewer has permission
  await PermissionsService.authorize(session.user.id, { slug: "projects.approve" })

  const project = await prisma.project.findUnique({
    where: { slug },
    select: { id: true, status: true },
  })

  if (!project) throw new Error("Project not found")

  if (project.status !== "PENDING_REVIEW") {
    throw new Error("Only projects pending review can be started")
  }

  const updated = await prisma.project.update({
    where: { slug },
    data: {
      status: "UNDER_REVIEW",
      reviewStartedAt: new Date(),
      reviewStartedBy: session.user.id,
    },
  })

  // Log audit
  try {
    await logProjectAction(project.id, "REVIEW_STARTED", session.user.id, { 
      fromStatus: "PENDING_REVIEW", 
      toStatus: "UNDER_REVIEW" 
    })
  } catch (e) {
    console.error("log startProjectReview error", e)
  }

  return updated
}

export async function approveProject(slug: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify approver has permission
  await PermissionsService.authorize(session.user.id, { slug: "projects.approve" })

  const project = await prisma.project.findUnique({
    where: { slug },
    select: { id: true, status: true },
  })

  if (!project) throw new Error("Project not found")

  if (project.status !== "UNDER_REVIEW") {
    throw new Error("Only projects under review can be approved")
  }

  const updated = await prisma.project.update({
    where: { slug },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: session.user.id,
    },
  })

  // Notify user and log audit
  try {
    const full = await prisma.project.findUnique({
      where: { slug },
      include: { user: { select: { email: true } } },
    })
    if (full) {
      await notifyUserOfApproval({ title: full.title, slug: full.slug!, user: { email: full.user?.email } }, { name: session.user.name })
      await logProjectAction(full.id, "APPROVED", session.user.id, { toStatus: "APPROVED" })
    }
  } catch (e) {
    console.error("notify/log approveProject error", e)
  }

  return updated
}

export async function rejectProject(slug: string, reason: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify approver has permission
  await PermissionsService.authorize(session.user.id, { slug: "projects.approve" })

  if (!reason || reason.trim().length === 0) {
    throw new Error("Rejection reason is required")
  }

  const project = await prisma.project.findUnique({
    where: { slug },
    select: { id: true, status: true },
  })

  if (!project) throw new Error("Project not found")

  if (project.status !== "UNDER_REVIEW") {
    throw new Error("Only projects under review can be rejected")
  }

  const updated = await prisma.project.update({
    where: { slug },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
    },
  })

  // Notify user and log audit
  try {
    const full = await prisma.project.findUnique({
      where: { slug },
      include: { user: { select: { email: true } } },
    })
    if (full) {
      await notifyUserOfRejection({ title: full.title, slug: full.slug!, user: { email: full.user?.email } }, reason, { name: session.user.name })
      await logProjectAction(full.id, "REJECTED", session.user.id, { reason, toStatus: "REJECTED" })
    }
  } catch (e) {
    console.error("notify/log rejectProject error", e)
  }

  return updated
}

export async function getProjectsForApproval() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify approver has permission
  await PermissionsService.authorize(session.user.id, { slug: "projects.approve" })

  return prisma.project.findMany({
    where: {
      status: { in: ["PENDING_REVIEW", "UNDER_REVIEW"] },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          color: true,
          imageFile: true,
        },
      },
      legalInstruments: {
        include: {
          legalInstrument: true,
          legalInstrumentInstance: {
            select: { status: true, type: true },
          },
        },
      },
      workPlan: {
        select: { id: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  })
}

export async function getProjectApprovalStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify approver has permission
  await PermissionsService.authorize(session.user.id, { slug: "projects.approve" })

  const [pendingReview, underReview, approved, rejected, total] = await Promise.all([
    prisma.project.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.project.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.project.count({ where: { status: "APPROVED" } }),
    prisma.project.count({ where: { status: "REJECTED" } }),
    prisma.project.count(),
  ])

  return {
    pendingReview,
    underReview,
    inReview: pendingReview + underReview,
    approved,
    rejected,
    total,
  }
}

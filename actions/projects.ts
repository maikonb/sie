"use server"

import { prisma } from "@/lib/config/db"
import { generateUniqueSlug } from "@/lib/utils/slug"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/config/auth"
import { APP_ERRORS } from "@/lib/errors"

export async function getProjectBySlug(slug: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const project = await prisma.project.findUnique({
    where: { slug: slug },
    include: {
      proponent: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              color: true,
              imageFile: true,
            },
          },
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
    },
  })

  if (!project) {
    return null
  }

  const proponent = await prisma.proponent.findUnique({ where: { userId: session.user.id }, select: { id: true } })

  if (!proponent) {
    throw new Error("Proponent not found")
  }

  // Ensure the user owns the project
  if (project.proponentId !== proponent.id) {
    throw new Error("Unauthorized access to project")
  }

  return project
}

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Unauthorized")

  const titulo = String(formData.get("titulo") || "").trim()
  const objetivos = String(formData.get("objetivos") || "").trim()
  const justificativa = String(formData.get("justificativa") || "").trim()
  const abrangencia = String(formData.get("abrangencia") || "").trim()

  if (!titulo || !objetivos || !justificativa || !abrangencia) {
    throw new Error(APP_ERRORS.GENERIC_ERROR.code)
  }

  const proponent = await prisma.proponent.findUnique({ where: { userId: session.user.id }, select: { id: true } })
  if (!proponent) throw new Error("Proponent not found")

  const slug = await generateUniqueSlug(titulo)

  return prisma.project.create({
    data: {
      title: titulo,
      slug,
      objectives: objetivos,
      justification: justificativa,
      scope: abrangencia,
      proponent: { connect: { id: proponent.id } },
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

  const proponent = await prisma.proponent.findFirst({
    where: { user: { email: session.user.email } },
  })

  if (!proponent) return []

  const projects = await prisma.project.findMany({
    where: { proponentId: proponent.id },
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

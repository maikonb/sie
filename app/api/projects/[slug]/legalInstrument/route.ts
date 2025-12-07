import prisma from "@/lib/config/db"
import { APP_ERRORS } from "@/lib/errors"
import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-utils"

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const result = await request.json()

    const legalInstrument = await prisma.legalInstrument.findFirst({ where: { type: result.type } })

    if (!legalInstrument) {
      return NextResponse.json({ error: APP_ERRORS.PROJECT_CREATE_LEGAL_INSTRUMENTS.code }, { status: 404 })
    }

    const project = await prisma.project.findUnique({ where: { slug: slug }, include: { legalInstruments: true } })

    if (!project) {
      return NextResponse.json({ error: APP_ERRORS.PROJECT_CREATE_LEGAL_INSTRUMENTS.code }, { status: 404 })
    }

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

        return
      },
      {
        timeout: 10000,
        isolationLevel: "Serializable",
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

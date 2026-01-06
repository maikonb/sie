import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { LegalInstrumentStatus } from "@prisma/client"
import { ProjectStatus } from "@prisma/client"

import { authOptions } from "@/lib/config/auth"
import prisma from "@/lib/config/db"
import { handleApiError, unauthorizedResponse } from "@/lib/api-utils"
import type { LegalInstrumentAnswers, LegalInstrumentFieldSpec } from "@/types/legal-instrument"

const bodySchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).default({}),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 })
    }

    const answers = parsed.data.answers as unknown as LegalInstrumentAnswers

    const instance = await prisma.legalInstrumentInstance.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            status: true,
          },
        },
        legalInstrumentVersion: {
          select: {
            fieldsJson: true,
          },
        },
      },
    })

    if (!instance) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    if (instance.project.status === ProjectStatus.UNDER_REVIEW || instance.project.status === ProjectStatus.APPROVED) {
      return NextResponse.json({ error: "project_locked" }, { status: 409 })
    }

    const fields = ((instance.legalInstrumentVersion.fieldsJson as unknown) as LegalInstrumentFieldSpec[]) || []
    const requiredFields = fields.filter((f) => f.required)

    const allRequiredFilled = requiredFields.every((f) => {
      const val = (answers as Record<string, unknown>)[f.id]
      return val !== undefined && val !== null && String(val).trim() !== ""
    })

    const anyFieldFilled = fields.some((f) => {
      const val = (answers as Record<string, unknown>)[f.id]
      return val !== undefined && val !== null && String(val).trim() !== ""
    })

    let newStatus: LegalInstrumentStatus
    if (allRequiredFilled) {
      newStatus = LegalInstrumentStatus.FILLED
    } else if (anyFieldFilled) {
      newStatus = LegalInstrumentStatus.PARTIAL
    } else {
      newStatus = LegalInstrumentStatus.PENDING
    }

    await prisma.legalInstrumentInstance.update({
      where: { id },
      data: {
        answers: answers as unknown as Prisma.InputJsonValue,
        status: newStatus,
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}

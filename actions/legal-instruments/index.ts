"use server"

import prisma from "@/lib/config/db"
import PermissionsService from "@/lib/services/permissions"
import { getAuthSession } from "@/lib/api-utils"
import { fileService } from "@/lib/services/file"
import { LegalInstrumentStatus } from "@prisma/client"
import { Prisma } from "@prisma/client"
import type { LegalInstrumentAnswers, LegalInstrumentFieldSpec, LegalInstrumentAnswerValue } from "@/types/legal-instrument"
import {
  legalInstrumentListValidator,
  legalInstrumentWithFileValidator,
  legalInstrumentInstanceWithFileValidator,
  GetLegalInstrumentsResponse,
  GetLegalInstrumentByIdResponse,
  UpdateLegalInstrumentResponse,
  PreviewLegalInstrumentResponse,
  SaveLegalInstrumentAnswersResponse,
  CheckExistingLegalInstrumentResponse,
} from "./types"

export type UpdateLegalInstrumentPayload = {
  fileKey?: string
  fieldsJson?: LegalInstrumentFieldSpec[]
}

export async function getLegalInstruments(): Promise<GetLegalInstrumentsResponse> {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await PermissionsService.authorize(session.user.id, { slug: "legal_instruments.manage" })

  return prisma.legalInstrument.findMany({
    ...legalInstrumentListValidator,
  })
}

export async function getLegalInstrumentById(id: string): Promise<GetLegalInstrumentByIdResponse> {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await PermissionsService.authorize(session.user.id, { slug: "legal_instruments.manage" })

  return prisma.legalInstrument.findUnique({
    where: { id },
    ...legalInstrumentWithFileValidator,
  })
}

export async function updateLegalInstrument(id: string, data: UpdateLegalInstrumentPayload): Promise<UpdateLegalInstrumentResponse> {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await PermissionsService.authorize(session.user.id, { slug: "legal_instruments.manage" })

  // If fileKey provided, create file record and update legalInstrument.fileId
  let fileRecord = null
  if (data.fileKey) {
    fileRecord = await fileService.createFileFromS3(data.fileKey)
  }

  const updateData: Prisma.LegalInstrumentUpdateInput = {}
  if (data.fieldsJson) updateData.fieldsJson = data.fieldsJson as unknown as Prisma.InputJsonValue
  if (fileRecord) updateData.file = { connect: { id: fileRecord.id } }

  return prisma.legalInstrument.update({
    where: { id },
    data: updateData,
    ...legalInstrumentWithFileValidator,
  })
}

export async function previewLegalInstrument(
  id: string,
  fieldsJson: LegalInstrumentFieldSpec[],
  sampleValues: Record<string, LegalInstrumentAnswerValue>
): Promise<PreviewLegalInstrumentResponse> {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await PermissionsService.authorize(session.user.id, { slug: "legal_instruments.manage" })

  const li = await prisma.legalInstrument.findUnique({ where: { id }, include: { file: true } })
  if (!li) throw new Error("not_found")

  if (!li.file || !li.file.url) {
    throw new Error("no_template")
  }

  // Only support text templates for preview
  let text = ""
  try {
    const fileStream = await fileService.getFileStream(li.file.key)
    if (fileStream.Body) {
      text = await fileStream.Body.transformToString()
    }
  } catch (error) {
    console.error("Error fetching file content:", error)
    throw new Error("failed_to_fetch_template")
  }

  const sample = sampleValues || {}
  const fields = fieldsJson || ((li.fieldsJson as unknown) as LegalInstrumentFieldSpec[]) || []

  let preview = text
  for (const f of fields) {
    const key = f.name
    const val = sample[key] ?? `{${key}}`
    preview = preview.split(`{${key}}`).join(String(val))
  }

  return { preview }
}

export async function saveLegalInstrumentAnswers(
  instanceId: string,
  answers: LegalInstrumentAnswers
): Promise<SaveLegalInstrumentAnswersResponse> {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Fetch instance with template file
  const instance = await prisma.legalInstrumentInstance.findUnique({
    where: { id: instanceId },
    include: { file: true },
  })

  if (!instance) throw new Error("Instance not found")

  let answerFileId = undefined

  // Determine status based on answers completeness
  const fields = ((instance.fieldsJson as unknown) as LegalInstrumentFieldSpec[]) || []
  const requiredFields = fields.filter((f) => f.required)
  const allRequiredFilled = requiredFields.every((f) => {
    const val = answers[f.id]
    return val !== undefined && val !== null && String(val).trim() !== ""
  })

  // Check if any fields have been filled
  const anyFieldFilled = fields.some((f) => {
    const val = answers[f.id]
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

  // If we have a template file, generate the filled version
  if (instance.file && allRequiredFilled) {
    try {
      // Get template content
      const fileStream = await fileService.getFileStream(instance.file.key)
      if (fileStream.Body) {
        let content = await fileStream.Body.transformToString()

        // Replace placeholders
        for (const field of fields) {
          const answerValue = answers[field.id]
          if (answerValue !== undefined && answerValue !== null) {
            content = content.split(`{{${field.id}}}`).join(String(answerValue))
          }
        }

        // Upload generated file
        const newFilename = `filled_${instance.file.filename}`
        const newFile = await fileService.uploadFile(
          content,
          newFilename,
          "text/plain",
          "legal-instruments/filled"
        )
        answerFileId = newFile.id
      }
    } catch (error) {
      console.error("Error generating filled file:", error)
    }
  }

  return prisma.legalInstrumentInstance.update({
    where: { id: instanceId },
    data: {
      answers,
      answerFileId,
      status: newStatus,
    },
    ...legalInstrumentInstanceWithFileValidator,
  })
}

export async function checkExistingLegalInstrument(projectSlug: string): Promise<CheckExistingLegalInstrumentResponse> {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true },
  })

  if (!project) throw new Error("Project not found")

  const existing = await prisma.projectLegalInstrument.findUnique({
    where: { projectId: project.id },
  })

  return { exists: !!existing }
}

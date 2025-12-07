"use server"

import prisma from "@/lib/config/db"
import PermissionsService from "@/lib/services/permissions"
import { getAuthSession } from "@/lib/api-utils"
import { fileService } from "@/lib/services/file"

export async function getLegalInstruments() {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await PermissionsService.authorize(session.user.id, { slug: "legal_instruments.manage" })

  return prisma.legalInstrument.findMany({
    select: { id: true, name: true, description: true, fileId: true, createdAt: true },
  })
}

export async function getLegalInstrumentById(id: string) {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await PermissionsService.authorize(session.user.id, { slug: "legal_instruments.manage" })

  return prisma.legalInstrument.findUnique({
    where: { id },
    include: { file: true },
  })
}

export async function updateLegalInstrument(id: string, data: any) {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await PermissionsService.authorize(session.user.id, { slug: "legal_instruments.manage" })

  // If fileKey provided, create file record and update legalInstrument.fileId
  let fileRecord = null
  if (data.fileKey) {
    fileRecord = await fileService.createFileFromS3(data.fileKey)
  }

  const updateData: any = {}
  if (data.fieldsJson) updateData.fieldsJson = data.fieldsJson
  if (fileRecord) updateData.fileId = fileRecord.id

  return prisma.legalInstrument.update({
    where: { id },
    data: updateData,
  })
}

export async function previewLegalInstrument(id: string, fieldsJson: any[], sampleValues: any) {
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
  const fields = fieldsJson || (li.fieldsJson as any[]) || []

  let preview = text
  for (const f of fields) {
    const key = f.name
    const val = sample[key] ?? `{${key}}`
    preview = preview.split(`{${key}}`).join(String(val))
  }

  return { preview }
}

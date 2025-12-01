"use server"

import { PrismaClient, LegalInstrumentType } from "@prisma/client"

const prisma = new PrismaClient()

export async function saveLegalInstrumentResult(projectId: string, result: { type: LegalInstrumentType; history: { question: string; answer: string }[] }) {
  try {
    // 1. Find the LegalInstrument template
    const legalInstrument = await prisma.legalInstrument.findFirst({
      where: { type: result.type },
    })

    if (!legalInstrument) {
      throw new Error(`Legal Instrument template not found for type: ${result.type}`)
    }

    // 2. Create the LegalInstrumentInstance
    const instance = await prisma.legalInstrumentInstance.create({
      data: {
        type: result.type,
        fieldsJson: result.history, // Storing history in fieldsJson for now as per requirement implies storing answers
        fileId: legalInstrument.fileId, // Copying the file reference from template
      },
    })

    // 3. Link to Project
    await prisma.projectLegalInstrument.create({
      data: {
        projectId,
        legalInstrumentId: legalInstrument.id,
        legalInstrumentInstanceId: instance.id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to save legal instrument result:", error)
    return { success: false, error: "Failed to save result" }
  }
}

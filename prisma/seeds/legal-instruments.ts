import { PrismaClient, LegalInstrumentType } from "@/prisma/client"

export async function seedLegalInstruments(prisma: PrismaClient) {
  console.log("Seeding Legal Instruments...")

  // Create a dummy file for the relation if it doesn't exist
  // We use upsert or findFirst to avoid duplicates if running multiple times
  let dummyFile = await prisma.file.findFirst({
    where: { key: "dummy-key" },
  })

  if (!dummyFile) {
    dummyFile = await prisma.file.create({
      data: {
        key: "dummy-key",
        url: "https://example.com/dummy.pdf",
        bucket: "dummy-bucket",
        filename: "dummy.pdf",
        contentType: "application/pdf",
        size: 1024,
      },
    })
  }

  const instruments = [
    { type: LegalInstrumentType.PDI_AGREEMENT, fieldsJson: {} },
    { type: LegalInstrumentType.SERVICE_CONTRACT, fieldsJson: {} },
    { type: LegalInstrumentType.APPDI_PRIVATE, fieldsJson: {} },
    { type: LegalInstrumentType.APPDI_NO_FUNDING, fieldsJson: {} },
    { type: LegalInstrumentType.COOP_AGREEMENT, fieldsJson: {} },
    { type: LegalInstrumentType.NDA, fieldsJson: {} },
    { type: LegalInstrumentType.TECH_TRANSFER, fieldsJson: {} },
    { type: LegalInstrumentType.REVIEW_SCOPE, fieldsJson: {} },
  ]

  for (const instrument of instruments) {
    // Check if exists to avoid duplicates
    const exists = await prisma.legalInstrument.findFirst({
      where: { type: instrument.type },
    })

    if (!exists) {
      await prisma.legalInstrument.create({
        data: {
          ...instrument,
          fileId: dummyFile.id,
        },
      })
    }
  }

  console.log("Legal Instruments seeded.")
}

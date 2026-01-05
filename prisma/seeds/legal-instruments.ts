import { PrismaClient, LegalInstrumentType } from "@prisma/client"

export async function seedLegalInstruments(prisma: PrismaClient) {
  console.log("Seeding Legal Instruments...")

  let dummyFile = await prisma.file.findFirst({
    where: { key: "dummy-key" },
  })

  if (!dummyFile) {
    // TODO: update to real values
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

  // TODO: insert real filds
  const instruments = [
    { name: "PDI", description: "Convênio de PD&I", type: LegalInstrumentType.PDI_AGREEMENT, fieldsJson: [{ id: "email", name: "email", type: "text", label: "Email", required: false }] },
    { name: "Contrato", description: "Contrato de Serviços Técnicos", type: LegalInstrumentType.SERVICE_CONTRACT, fieldsJson: [{ id: "email", name: "email", type: "text", label: "Email", required: false }] },
    { name: "APPDI", description: "APPDI com aporte privado", type: LegalInstrumentType.APPDI_PRIVATE, fieldsJson: [{ id: "email", name: "email", type: "text", label: "Email", required: false }] },
    { name: "APPDI", description: "APPDI sem aporte", type: LegalInstrumentType.APPDI_NO_FUNDING, fieldsJson: [{ id: "email", name: "email", type: "text", label: "Email", required: false }] },
    { name: "Cooperação", description: "Acordo / Termo de Cooperação", type: LegalInstrumentType.COOP_AGREEMENT, fieldsJson: [{ id: "email", name: "email", type: "text", label: "Email", required: false }] },
    { name: "NDA", description: "NDA/Termo de Confidencialidade", type: LegalInstrumentType.NDA, fieldsJson: [{ id: "email", name: "email", type: "text", label: "Email", required: false }] },
    { name: "Transferência", description: "Licenciamento/Transferência de Tecnologia", type: LegalInstrumentType.TECH_TRANSFER, fieldsJson: [{ id: "email", name: "email", type: "text", label: "Email", required: false }] },
    { name: "Avaliação", description: "Rever escopo/enquadramento (Fluxo não encontrou classificação adequada)", type: LegalInstrumentType.REVIEW_SCOPE, fieldsJson: [] },
  ]

  for (const instrument of instruments) {
    const existing = await prisma.legalInstrument.findUnique({
      where: { type: instrument.type },
      select: { id: true },
    })

    if (existing) continue

    await prisma.legalInstrument.create({
      data: {
        name: instrument.name,
        description: instrument.description,
        type: instrument.type,
        fieldsJson: instrument.fieldsJson as any,
        templateFileId: dummyFile.id,
      },
    })
  }
}

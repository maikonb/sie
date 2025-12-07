import { description } from "@/app/admin/layout"
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
    { name:'PDI', description: 'Convênio de PD&I', type: LegalInstrumentType.PDI_AGREEMENT, fieldsJson: {} },
    { name:'Contrato', description: 'Contrato de Serviços Técnicos', type: LegalInstrumentType.SERVICE_CONTRACT, fieldsJson: {} },
    { name:'APPDI', description: 'APPDI com aporte privado', type: LegalInstrumentType.APPDI_PRIVATE, fieldsJson: {} },
    { name:'APPDI', description: 'APPDI sem aporte', type: LegalInstrumentType.APPDI_NO_FUNDING, fieldsJson: {} },
    { name:'Cooperação', description: 'Acordo / Termo de Cooperação', type: LegalInstrumentType.COOP_AGREEMENT, fieldsJson: {} },
    { name:'NDA', description: 'NDA/Termo de Confidencialidade', type: LegalInstrumentType.NDA, fieldsJson: {} },
    { name:'Transferência', description: 'Licenciamento/Transferência de Tecnologia', type: LegalInstrumentType.TECH_TRANSFER, fieldsJson: {} },
    { name:'Avaliação', description: 'Rever escopo/enquadramento (Fluxo não encontrou classificação adequada)', type: LegalInstrumentType.REVIEW_SCOPE, fieldsJson: {} },
  ]

  for (const instrument of instruments) {
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
}

import { PrismaClient, ProjectStatus, LegalInstrumentStatus } from "../client"

export async function seedDevProjects(prisma: PrismaClient) {
  console.log("Seeding Development Projects for 'teste'...")

  const user = await prisma.user.findUnique({
    where: { email: "teste@ufr.edu.br" },
  })

  if (!user) {
    console.error("User 'teste@ufr.edu.br' not found. Skipping dev projects.")
    return
  }

  let instrumentVersion = await prisma.legalInstrumentVersion.findFirst()
  if (!instrumentVersion) {
    // Try to create an initial version from an existing LegalInstrument (seedLegalInstruments should
    // have created the base instruments and template files). If none exist, skip.
    const legalInstrument = await prisma.legalInstrument.findFirst()
    if (!legalInstrument) {
      console.error("No LegalInstrument found. Skipping dev projects.")
      return
    }

    instrumentVersion = await prisma.legalInstrumentVersion.create({
      data: {
        legalInstrumentId: legalInstrument.id,
        version: 1,
        revisionKey: legalInstrument.revisionKey,
        type: legalInstrument.type,
        fieldsJson: legalInstrument.fieldsJson as any,
        templateFileId: legalInstrument.templateFileId,
      },
    })

    console.log(`Created initial LegalInstrumentVersion ${instrumentVersion.id} for instrument ${legalInstrument.type}`)
  }

  const projectStatuses = Object.values(ProjectStatus)
  const now = new Date()

  for (let i = 1; i <= 30; i++) {
    const status = projectStatuses[Math.floor(Math.random() * projectStatuses.length)]
    const daysAgo = Math.floor(Math.random() * 180) // Last 6 months
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    // Some projects have submittedAt, others don't (if DRAFT)
    const submittedAt = status !== ProjectStatus.DRAFT ? new Date(createdAt.getTime() + 1000 * 60 * 60 * 2) : null
    const data = {
      slug: `teste-${i.toString().padStart(2, "0")}`,
      title: `Projeto de Pesquisa ${i.toString().padStart(2, "0")}`,
      objectives: `Objetivos detalhados para o projeto ${i}. Este é um projeto gerado automaticamente para testes.`,
      justification: `Justificativa técnica para a execução do projeto ${i}.`,
      scope: `Escopo de atuação e limites do projeto ${i}.`,
      status,
      userId: user.id,
      createdAt,
      submittedAt,
      legalInstrumentInstance: {
        create: {
          legalInstrumentVersionId: instrumentVersion.id,
          status: LegalInstrumentStatus.PENDING,
          answers: {},
        },
      },
    }
    
    await prisma.project.upsert({
      where: {slug: `teste-${i.toString().padStart(2, "0")}`},
      create: data,
      update: {slug: `teste-${i.toString().padStart(2, "0")}`}
    })
  }

  console.log("30 Development Projects seeded.")
}

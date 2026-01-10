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

  const instrumentVersion = await prisma.legalInstrumentVersion.findFirst()
  if (!instrumentVersion) {
    console.error("No LegalInstrumentVersion found. Skipping dev projects.")
    return
  }

  const projectStatuses = Object.values(ProjectStatus)
  const now = new Date()

  for (let i = 1; i <= 30; i++) {
    const status = projectStatuses[Math.floor(Math.random() * projectStatuses.length)]
    const daysAgo = Math.floor(Math.random() * 180) // Last 6 months
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    // Some projects have submittedAt, others don't (if DRAFT)
    const submittedAt = status !== ProjectStatus.DRAFT ? new Date(createdAt.getTime() + 1000 * 60 * 60 * 2) : null

    await prisma.project.create({
      data: {
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
      },
    })
  }

  console.log("30 Development Projects seeded.")
}

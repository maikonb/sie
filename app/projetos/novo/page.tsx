import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PartnershipType } from "@prisma/client"

import { ProjectForm } from "@/components/projects/project-form"

// Server Action: cria o Projeto e redireciona
async function createProjeto(formData: FormData) {
  "use server"

  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  if (!email) {
    redirect("/auth/login")
  }

  const titulo = String(formData.get("titulo") || "").trim()
  const objetivos = String(formData.get("objetivos") || "").trim()
  const justificativa = String(formData.get("justificativa") || "").trim()
  const abrangencia = String(formData.get("abrangencia") || "").trim()
  const partnershipType = String(formData.get("partnershipType") || "") as PartnershipType

  // validações mínimas
  if (!titulo || !objetivos || !justificativa || !abrangencia) {
    throw new Error("Preencha todos os campos obrigatórios.")
  }

  // encontra o Proponente pelo e-mail (único)
  const proponente = await prisma.proponent.findUnique({
    where: { email },
    select: { id: true },
  })

  if (!proponente) {
    throw new Error("Proponente não encontrado para este usuário.")
  }

  await prisma.project.create({
    data: {
      title: titulo,
      objectives: objetivos,
      justification: justificativa,
      scope: abrangencia,
      proponent: { connect: { id: proponente.id } },
      partnerships: partnershipType
        ? {
            create: {
              type: partnershipType,
              isPrimary: true,
            },
          }
        : undefined,
    },
  })

  redirect("/projetos/")
}

export default async function NovaPaginaProjeto() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/login")

  return (
    <div className="p-4 bg-muted/50 min-h-screen flex items-center justify-center">
      <ProjectForm createAction={createProjeto} />
    </div>
  )
}

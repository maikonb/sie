import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

import { ProjectForm } from "@/components/projects/project-form"
import { generateUniqueSlug } from "@/lib/slug"

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

  // validações mínimas
  if (!titulo || !objetivos || !justificativa || !abrangencia) {
    throw new Error("Preencha todos os campos obrigatórios.")
  }

  // encontra o Proponente pelo userId (que deve estar na sessão)
  const userId = session.user.id as string
  const proponente = await prisma.proponent.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!proponente) {
    throw new Error("Proponente não encontrado para este usuário.")
  }

  const slug = await generateUniqueSlug(titulo)

  await prisma.project.create({
    data: {
      title: titulo,
      slug,
      objectives: objetivos,
      justification: justificativa,
      scope: abrangencia,
      proponent: { connect: { id: proponente.id } },
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

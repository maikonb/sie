import { ProjectForm } from "@/components/forms/project/create"
import { Project } from "@prisma/client"
import { getProjectBySlug } from "@/actions/projects"

interface PageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function NovaPaginaProjeto(props: PageProps) {
  const { slug = null } = await props.searchParams

  let initialProject: Project | null = null
  if (slug) {
    try {
      initialProject = await getProjectBySlug(slug)
    } catch (error) {
      console.error("Failed to fetch project:", error)
    }
  }

  return (
    <div className="max-w-5xl w-full mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Projeto</h1>
        <p className="text-muted-foreground mt-2">Preencha os dados para criar um novo projeto.</p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <ProjectForm initialProject={initialProject} embedded />
      </div>
    </div>
  )
}

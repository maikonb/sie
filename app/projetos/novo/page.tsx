import { prisma } from "@/lib/config/db"

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
      // Handle error appropriately, maybe redirect or show error
    }
  }

  return (
    <div className="p-4 bg-muted/50 min-h-full flex items-center justify-center">
      <ProjectForm initialProject={initialProject} />
    </div>
  )
}

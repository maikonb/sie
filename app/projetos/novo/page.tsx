import { prisma } from "@/lib/db"

import { ProjectForm } from "@/components/forms/project/create"
import { Project } from "@prisma/client"

interface PageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function NovaPaginaProjeto(props: PageProps) {
  const { slug = null } = await props.searchParams

  let initialProject: Project | null = null
  if (slug) {
    initialProject = await prisma.project.findUnique({
      where: { slug },
    })
  }

  return (
    <div className="py-4 bg-muted/50 min-h-full flex items-center justify-center">
      <ProjectForm initialProject={initialProject} />
    </div>
  )
}

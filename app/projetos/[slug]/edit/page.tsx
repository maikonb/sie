import { getProjectBySlug } from "@/actions/projects"
import { EditProjectForm } from "@/components/forms/project/edit"
import { notFound } from "next/navigation"

export default async function EditProjectPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="container py-10">
      <EditProjectForm project={project} />
    </div>
  )
}

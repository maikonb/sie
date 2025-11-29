import { WorkPlanForm } from "@/components/projects/work-plan/work-plan-form"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

export default async function WorkPlanPage({ params, searchParams }: { params: { slug: string }; searchParams: { returnTo?: string } }) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: { workPlan: true },
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Editar Plano de Trabalho: {project.title}</h1>
      <WorkPlanForm project={project} initialData={project.workPlan} returnTo={searchParams.returnTo} />
    </div>
  )
}

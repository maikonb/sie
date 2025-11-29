import { LegalInstrumentFlow } from "@/components/projects/legal-instrument/legal-instrument-flow"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

export default async function LegalPage({ params, searchParams }: { params: { slug: string }; searchParams: { returnTo?: string } }) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Definir Instrumento Jurídico: {project.title}</h1>
      <LegalInstrumentFlow project={project} returnTo={searchParams.returnTo} />
    </div>
  )
}

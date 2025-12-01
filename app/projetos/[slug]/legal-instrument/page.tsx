"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectClassificationWizard } from "@/components/projects/project-classification-wizard"
import { useProject } from "@/components/providers/project-context"
import { Skeleton } from "@/components/ui/skeleton"
import { saveLegalInstrumentResult } from "@/app/actions/legal-instrument"
import { toast } from "sonner"

export default function Page() {
  const router = useRouter()
  const { project, loading } = useProject()

  const handleComplete = async (res: any) => {
    if (!project) return

    const result = await saveLegalInstrumentResult(project.id, res)
    if (result.success) {
      toast.success("Instrumento jurídico salvo com sucesso!")
      router.push(`/projetos/${project.slug}/work-plan`)
    } else {
      toast.error("Erro ao salvar instrumento jurídico")
    }
  }

  const handleBack = () => {
    // Check if there is a previous history entry, otherwise fallback to project page
    if (window.history.length > 2) {
      router.back()
    } else {
      router.push(`/projetos/${project?.slug}`)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <div className="mb-8">
        <Button variant="ghost" onClick={handleBack} className="-ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="flex items-center justify-center">
        <ProjectClassificationWizard onComplete={handleComplete} />
      </div>
    </div>
  )
}

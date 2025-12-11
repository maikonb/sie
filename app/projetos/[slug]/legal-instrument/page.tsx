"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import ProjectClassificationStart from "@/components/projects/project-classification-start"
import { ProjectClassificationWizard } from "@/components/projects/project-classification-wizard"
import { useProject } from "@/components/providers/project-context"
import { Skeleton } from "@/components/ui/skeleton"
import { createLegalInstrument } from "@/actions/projects"
import { notify } from "@/lib/notifications"
import { APP_ERRORS } from "@/lib/errors"

export default function Page() {
  const router = useRouter()
  const { project, loading } = useProject()
  const [mode, setMode] = useState<"start" | "wizard">("start")
  const [initialState, setInitialState] = useState<any>(null)

  const handleComplete = async (res: any) => {
    if (!project || !project.slug) return

    const result = await createLegalInstrument(project.slug, res)

    if (result.success) {
      notify.success("Instrumento jurídico salvo com sucesso!")
      router.push(`/projetos/${project.slug}/work-plan`)
    } else {
      if (result.error) notify.error(result.error)
      notify.error(APP_ERRORS.GENERIC_ERROR.code)
    }
  }

  const handleStart = () => {
    setInitialState(null)
    setMode("wizard")
  }

  const handleResume = (savedState: any) => {
    setInitialState(savedState)
    setMode("wizard")
  }

  const handleWizardReset = () => {
    localStorage.removeItem("legalInstrumentWizard")
    setInitialState(null)
    setMode("start")

    const url = new URL(window.location.href)
    url.searchParams.delete("state")
    router.replace(url.pathname + url.search)
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
      <div className="container mx-auto py-12 px-4 space-y-8 max-w-5xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="h-full bg-linear-to-b from-background to-muted/20">
      <div className="container min-h-full mx-auto py-6 px-4 md:py-8 flex flex-col">
        <div className="flex-1 flex flex-col h-full justify-center">{mode === "start" ? <ProjectClassificationStart projectSlug={project.slug!} onStart={handleStart} onResume={handleResume} /> : <ProjectClassificationWizard initialState={initialState} onReset={handleWizardReset} onComplete={handleComplete} />}</div>
      </div>
    </div>
  )
}

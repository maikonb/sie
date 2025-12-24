"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useParams, useRouter } from "next/navigation"
import { getProjectBySlug, getProjectViewerContext } from "@/actions/projects"
import type { GetProjectBySlugResponse, ProjectViewerContext } from "@/actions/projects/types"

interface ProjectContextType {
  project: GetProjectBySlugResponse
  loading: boolean
  dependences: Record<string, any>
  view: ProjectViewerContext | null
  refetch: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const params: { slug: string } = useParams()
  const router = useRouter()
  const [project, setProject] = useState<GetProjectBySlugResponse>(null)
  const [loading, setLoading] = useState(true)
  const [dependences, setDependences] = useState({})
  const [view, setView] = useState<ProjectViewerContext | null>(null)

  const fetchProject = async () => {
    try {
      setLoading(true)
      const [data, viewer] = await Promise.all([getProjectBySlug(params.slug), getProjectViewerContext(params.slug)])
      if (!data) {
        router.push("/404")
        return
      }

      setProject(data)
      setView(viewer)
      setDependences({
        "work-plan": data?.workPlan || null,
        "legal-instrument": data?.legalInstruments || null,
      })
    } catch (error: any) {
      console.error("Failed to fetch project:", error)
      if (error.response?.status === 404) router.push("/404")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.slug) {
      fetchProject()
    }
  }, [params.slug, router])

  return <ProjectContext.Provider value={{ project, dependences, loading, view, refetch: fetchProject }}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}

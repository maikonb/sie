"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useParams, useRouter } from "next/navigation"
import { Prisma } from "@prisma/client"
import { projectService } from "@/services/api/project"

const projectWithRelations = Prisma.validator<Prisma.ProjectDefaultArgs>()({
  include: {
    proponent: {
      include: {
        user: {
          select: {
            name: true,
            email: true,
            color: true,
            imageFile: true,
          },
        },
      },
    },
    legalInstruments: true,
  },
})

export type ProjectType = Prisma.ProjectGetPayload<typeof projectWithRelations> | null

interface ProjectContextType {
  project: ProjectType
  loading: boolean
  refetch: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectType>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = async () => {
    try {
      setLoading(true)
      const data = await projectService.getBySlug(params.slug as string)
      setProject(data)
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

  return <ProjectContext.Provider value={{ project, loading, refetch: fetchProject }}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}

"use client"

import { useProject } from "@/components/providers/project-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function Page() {
  const { project, loading } = useProject()

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
    <div>
      <h1>Plano de negócio</h1>
    </div>
  )
}
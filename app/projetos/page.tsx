"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, FileText, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getAllProjects } from "@/actions/projects"
import useCan from "@/hooks/use-can"
import { PageContent, PageHeader, PageHeaderDescription, PageHeaderHeading, PageShell } from "@/components/shell"

interface Project {
  id: number
  slug?: string
  title: string
  updatedAt: Date
  status?: "DRAFT" | "IN_ANALYSIS" | "APPROVED" | "REJECTED"
  workPlan?: { id: string } | null
  legalInstruments?: {
    legalInstrumentInstance: {
      status: "DRAFT" | "SENT_FOR_ANALYSIS" | "APPROVED" | "REJECTED"
      type: string
    }
  }[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { can: canCreate, loading: loadingCreate } = useCan("projects.create")

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getAllProjects()
        setProjects(data as any) // Type casting as quick fix, better to define proper types
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <PageShell>
      <PageHeader>
        <div className="space-y-1">
          <PageHeaderHeading>Projetos</PageHeaderHeading>
          <PageHeaderDescription>Gerencie seus projetos de pesquisa e inovação.</PageHeaderDescription>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/projetos/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo Projeto
            </Link>
          </Button>
        )}
      </PageHeader>

      <PageContent>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-[200px]">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-lg text-muted-foreground mb-4">Nenhum projeto encontrado.</p>
            <Button variant="outline" asChild>
              {canCreate && (<Link href="/projetos/novo">Criar meu primeiro projeto</Link>)}
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const hasWorkPlan = !!project.workPlan
              const legalInstrument = project.legalInstruments?.[0]?.legalInstrumentInstance
              const status = project.status || "DRAFT"
              const statusLabel = {
                DRAFT: "Em Elaboração",
                IN_ANALYSIS: "Em Análise",
                APPROVED: "Aprovado",
                REJECTED: "Rejeitado",
              }[status]

              const statusColor = {
                DRAFT: "bg-muted text-muted-foreground",
                IN_ANALYSIS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              }[status]

              return (
                <Link key={project.id} href={`/projetos/${project.slug || project.id}`} className="group block h-full">
                  <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-md flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>{statusLabel}</div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: ptBR })}</span>
                      </div>
                      <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`flex items-center gap-2 p-2 rounded-md border ${hasWorkPlan ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30" : "bg-muted/50 border-transparent"}`}>
                          <div className={`p-1.5 rounded-full ${hasWorkPlan ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">Plano</span>
                            <span className="text-[10px] text-muted-foreground">{hasWorkPlan ? "Concluído" : "Pendente"}</span>
                          </div>
                        </div>

                        <div className={`flex items-center gap-2 p-2 rounded-md border ${legalInstrument ? "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30" : "bg-muted/50 border-transparent"}`}>
                          <div className={`p-1.5 rounded-full ${legalInstrument ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-muted text-muted-foreground"}`}>
                            <Scale className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">Jurídico</span>
                            <span className="text-[10px] text-muted-foreground">{legalInstrument ? "Anexado" : "Pendente"}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </PageContent>
    </PageShell>
  )
}

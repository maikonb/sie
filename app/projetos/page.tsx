"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getAllProjects } from "@/actions/projects"
import { PageContent, PageHeader, PageHeaderDescription, PageHeaderHeading, PageShell } from "@/components/shell"

interface Project {
  id: number
  slug?: string
  title: string
  updatedAt: Date
  partnerships: { type: string }[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

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
        <Button asChild>
          <Link href="/projetos/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Projeto
          </Link>
        </Button>
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
              <Link href="/projetos/novo">Criar meu primeiro projeto</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <Link href={`/projetos/${project.slug || project.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="line-clamp-2 text-lg">{project.title}</CardTitle>
                    </div>
                    <CardDescription>Atualizado {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: ptBR })}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">Clique para ver detalhes e gerenciar o plano de trabalho.</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </PageShell>
  )
}

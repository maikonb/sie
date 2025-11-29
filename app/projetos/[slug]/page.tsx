"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, FileText, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { UserAvatar } from "@/components/user-avatar"
import { Pencil } from "lucide-react"

interface Project {
  id: number
  title: string
  objectives: string
  justification: string
  scope: string
  createdAt: string
  updatedAt: string
  partnerships: { type: string }[]
  proponent: {
    name: string
    email: string
    institution: string | null
    imageFile?: {
      url: string
    } | null
    user: {
      color: string
    }
  }
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.slug}`)
        if (response.ok) {
          const data = await response.json()
          setProject(data)
        } else {
          // Handle error (e.g., redirect to 404 or list)
          if (response.status === 404) router.push("/404")
        }
      } catch (error) {
        console.error("Failed to fetch project:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchProject()
    }
  }, [params.slug, router])

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
    <div className="p-8 space-y-8 max-w-7xl w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Button variant="ghost" size="sm" asChild className="-ml-3">
              <Link href="/projetos">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            {project.partnerships?.[0] && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {project.partnerships[0].type.replace(/_/g, " ")}
              </Badge>
            )}
            <span className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              Criado em {format(new Date(project.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="workplan">Plano de Trabalho</TabsTrigger>
          <TabsTrigger value="legal">Instrumento Jurídico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Main Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Detalhes do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Objetivos
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.objectives}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Justificativa</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.justification}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Abrangência</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.scope}</p>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Proponente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    {project.proponent.imageFile?.url ? (
                      <UserAvatar
                        size="md"
                        preview={{
                          name: project.proponent.name,
                          image: project.proponent.imageFile?.url,
                          color: project.proponent.user?.color,
                        }}
                      />
                    ) : (
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{project.proponent.name}</p>
                      <p className="text-xs text-muted-foreground">{project.proponent.email}</p>
                    </div>
                  </div>
                  {project.proponent.institution && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground">Instituição</p>
                      <p className="text-sm">{project.proponent.institution}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workplan">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Plano de Trabalho</CardTitle>
                <CardDescription>Visualize as metas e cronograma.</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projetos/${project.slug}/work-plan?returnTo=/projetos/${project.slug}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {project.workPlan ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">Objetivo Geral</h3>
                    <p className="text-sm text-muted-foreground">{project.workPlan.generalObjective || "Não definido"}</p>
                  </div>
                  {/* Add more read-only fields as needed */}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">Nenhum plano de trabalho definido.</p>
                  <Button asChild>
                    <Link href={`/projetos/${project.slug}/work-plan?returnTo=/projetos/${project.slug}`}>Criar Plano de Trabalho</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Instrumento Jurídico</CardTitle>
                <CardDescription>Status e documentos da parceria.</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projetos/${project.slug}/legal?returnTo=/projetos/${project.slug}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Gerenciar
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {project.partnerships && project.partnerships.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Tipo de Parceria:</span>
                    <Badge variant="secondary">{project.partnerships[0].type.replace(/_/g, " ")}</Badge>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">Nenhum instrumento jurídico definido.</p>
                  <Button asChild>
                    <Link href={`/projetos/${project.slug}/legal?returnTo=/projetos/${project.slug}`}>Definir Instrumento</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

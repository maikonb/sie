"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, FileText, User, Scale, Download, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { UserAvatar } from "@/components/user-avatar"
import { useProject } from "@/components/providers/project-context"

export default function ProjectDetailsPage() {
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
                    {project.proponent.user?.imageFile?.url ? (
                      <UserAvatar
                        size="md"
                        preview={{
                          name: project.proponent.user?.name,
                          image: project.proponent.user?.imageFile?.url,
                          color: project.proponent.user?.color,
                        }}
                      />
                    ) : (
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{project.proponent.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{project.proponent.user?.email}</p>
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

            {/* Legal Instrument Card */}
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" /> Instrumento Jurídico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.legalInstruments && project.legalInstruments.length > 0 ? (
                    <div className="space-y-4">
                      {project.legalInstruments.map((li: any) => {
                        const instance = li.legalInstrumentInstance
                        const instrument = li.legalInstrument
                        const hasAnswerFile = instance?.answerFile

                        return (
                          <div key={li.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                            <div>
                              <h4 className="font-semibold">{instrument.name}</h4>
                              <p className="text-sm text-muted-foreground">{instrument.description}</p>
                              {hasAnswerFile && <span className="text-xs text-green-600 font-medium mt-1 block">Documento gerado em {format(new Date(instance.updatedAt), "dd/MM/yyyy")}</span>}
                            </div>
                            <div className="flex gap-2">
                              {hasAnswerFile ? (
                                <>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/projetos/${project.slug}/legal-instruments/fill`}>
                                      <Edit className="mr-2 h-4 w-4" /> Editar Respostas
                                    </Link>
                                  </Button>
                                  <Button size="sm" asChild>
                                    <Link href={instance.answerFile.url} target="_blank">
                                      <Download className="mr-2 h-4 w-4" /> Download
                                    </Link>
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" asChild>
                                  <Link href={`/projetos/${project.slug}/legal-instruments/fill`}>Preencher Instrumento</Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-muted-foreground">Nenhum instrumento jurídico selecionado para este projeto.</p>
                      <Button asChild>
                        <Link href={`/projetos/${project.slug}/legal-instrument`}>Selecionar Instrumento</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workplan">
          <Card>
            <CardHeader>
              <CardTitle>Plano de Trabalho</CardTitle>
              <CardDescription>Gerencie as metas, cronograma e equipe do projeto.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg m-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Funcionalidade em desenvolvimento.</p>
                <Button disabled>Criar Plano de Trabalho</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

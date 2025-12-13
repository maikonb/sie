"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, FileText, Plus, Edit, Scale, Download, Eye } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useProject } from "@/components/providers/project-context"
import { cn } from "@/lib/utils"
import { InlineEdit } from "@/components/ui/inline-edit"
import { updateProject } from "@/actions/projects"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { PageContent, PageHeader, PageHeaderDescription, PageHeaderHeading, PageShell } from "@/components/shell"

export default function ProjectDetailsPage() {
  const { project, dependences, loading, refetch } = useProject()

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </PageShell>
    )
  }

  if (!project) return null

  const workPlan = dependences["work-plan"]
  const legalInstruments = (dependences["legal-instrument"] as any[]) || []

  // Calculate dependencies
  const missingDependencies = []

  // 1. Work Plan Dependency
  if (!workPlan) {
    missingDependencies.push({
      id: "work-plan",
      label: "Plano de Trabalho",
      description: "O plano de trabalho ainda não foi criado.",
      link: `/projetos/${project.slug}/work-plan`,
      action: "Criar Plano",
    })
  }

  // 2. Legal Instrument Dependency
  // If no legal instrument is selected
  if (legalInstruments.length === 0) {
    missingDependencies.push({
      id: "legal-instrument-select",
      label: "Instrumento Jurídico",
      description: "Nenhum instrumento jurídico foi selecionado.",
      link: `/projetos/${project.slug}/legal-instrument`,
      action: "Selecionar Instrumento",
    })
  } else {
    // If selected but not filled (check for answerFile or answers)
    // Assuming if answerFile is present, it's filled. Or we can check if answers are present.
    // The previous code checked `instance?.answerFile`.
    const pendingInstruments = legalInstruments.filter((li) => !li.legalInstrumentInstance?.answerFile)

    pendingInstruments.forEach((li) => {
      missingDependencies.push({
        id: `legal-instrument-fill-${li.id}`,
        label: `Preencher ${li.legalInstrument.name}`,
        description: "O instrumento jurídico precisa ser preenchido.",
        link: `/projetos/${project.slug}/legal-instrument/fill`,
        action: "Preencher",
      })
    })
  }

  const handleUpdate = async (field: string, value: string) => {
    if (!project) return

    const formData = new FormData()
    formData.append("titulo", project.title)
    formData.append("objetivos", project.objectives)
    formData.append("justificativa", project.justification)
    formData.append("abrangencia", project.scope)

    // Update specific field
    formData.set(field, value)

    try {
      await updateProject(project.slug!, formData)
      toast.success("Projeto atualizado com sucesso!")
      await refetch()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar projeto.")
    }
  }

  return (
    <PageShell>
      {/* Header */}
      <PageHeader className="flex-col items-start gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Button variant="ghost" size="sm" asChild className="-ml-3">
              <Link href="/projetos">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Link>
            </Button>
          </div>
          <PageHeaderHeading>{project.title}</PageHeaderHeading>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              Criado em {format(new Date(project.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
      </PageHeader>

      {/* Content */}
      <PageContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="workplan">Plano de Trabalho</TabsTrigger>
            <TabsTrigger value="legal-instrument">Instrumento Jurídico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Main Info */}
              <Card className={cn(missingDependencies.length > 0 ? "md:col-span-2" : "md:col-span-3")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Detalhes do Projeto</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/projetos/${project.slug}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Objetivos
                    </h3>
                    <InlineEdit value={project.objectives} onSave={(val) => handleUpdate("objetivos", val)} label="Objetivos" multiline />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Justificativa</h3>
                    <InlineEdit value={project.justification} onSave={(val) => handleUpdate("justificativa", val)} label="Justificativa" multiline />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Abrangência</h3>
                    <InlineEdit value={project.scope} onSave={(val) => handleUpdate("abrangencia", val)} label="Abrangência" multiline />
                  </div>
                </CardContent>
              </Card>

              {/* Dependencies Card */}
              {missingDependencies.length > 0 && (
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-900">
                  <CardHeader>
                    <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Pendências
                    </CardTitle>
                    <CardDescription>Itens que precisam de atenção para prosseguir.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {missingDependencies.map((dep) => (
                      <div key={dep.id} className="bg-white dark:bg-card p-4 rounded-lg border shadow-sm">
                        <h4 className="font-medium mb-1">{dep.label}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{dep.description}</p>
                        <Button size="sm" variant="outline" className="w-full border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-800 dark:hover:bg-orange-950" asChild>
                          <Link href={dep.link}>{dep.action}</Link>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="workplan">
            <Card>
              <CardHeader>
                <CardTitle>Plano de Trabalho</CardTitle>
                <CardDescription>Gerencie as metas, cronograma e equipe do projeto.</CardDescription>
              </CardHeader>
              <CardContent>
                {workPlan ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                      <div>
                        <h4 className="font-semibold">Plano de Trabalho Ativo</h4>
                        <p className="text-sm text-muted-foreground">Criado em {format(new Date(workPlan.createdAt), "dd/MM/yyyy")}</p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/projetos/${project.slug}/work-plan`}>
                          <Edit className="mr-2 h-4 w-4" /> Editar Plano
                        </Link>
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">Objetivo Geral</h4>
                        <p className="text-sm text-muted-foreground">{workPlan.generalObjective}</p>
                      </div>
                      <div className="p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">Vigência</h4>
                        <p className="text-sm text-muted-foreground">
                          {workPlan.validityStart ? format(new Date(workPlan.validityStart), "dd/MM/yyyy") : "-"} até {workPlan.validityEnd ? format(new Date(workPlan.validityEnd), "dd/MM/yyyy") : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg m-6 gap-4">
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Nenhum plano de trabalho encontrado</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">Crie um plano de trabalho para definir os objetivos, cronograma e equipe do projeto.</p>
                    </div>
                    <Button asChild>
                      <Link href={`/projetos/${project.slug}/work-plan`}>
                        <Plus className="mr-2 h-4 w-4" /> Criar Plano de Trabalho
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal-instrument">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" /> Instrumento Jurídico
                </CardTitle>
                <CardDescription>Gerencie os documentos legais do projeto.</CardDescription>
              </CardHeader>
              <CardContent>
                {legalInstruments.length > 0 ? (
                  <div className="space-y-4">
                    {legalInstruments.map((li: any) => {
                      const instance = li.legalInstrumentInstance
                      const instrument = li.legalInstrument
                      const hasAnswerFile = instance?.answerFile
                      const status = instance?.status || "DRAFT"

                      return (
                        <div key={li.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{instrument.name}</h4>
                              {status === "SENT_FOR_ANALYSIS" && <Badge className="bg-blue-500">Em Análise</Badge>}
                              {status === "APPROVED" && <Badge className="bg-green-500">Aprovado</Badge>}
                              {status === "REJECTED" && <Badge variant="destructive">Rejeitado</Badge>}
                              {status === "DRAFT" && <Badge variant="secondary">Rascunho</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{instrument.description}</p>
                            {hasAnswerFile ? <span className="text-xs text-green-600 font-medium mt-1 block">Documento gerado em {format(new Date(instance.updatedAt), "dd/MM/yyyy")}</span> : <span className="text-xs text-orange-600 font-medium mt-1 block">Pendente de preenchimento</span>}
                          </div>
                          <div className="flex gap-2">
                            {status === "DRAFT" ? (
                              <Button size="sm" asChild>
                                <Link href={`/projetos/${project.slug}/legal-instrument/fill`}>{hasAnswerFile ? "Continuar Preenchimento" : "Preencher Instrumento"}</Link>
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/projetos/${project.slug}/legal-instrument/fill`}>
                                  <Eye className="mr-2 h-4 w-4" /> Visualizar
                                </Link>
                              </Button>
                            )}

                            {hasAnswerFile && (
                              <Button size="sm" variant="outline" asChild>
                                <Link href={instance.answerFile.url} target="_blank">
                                  <Download className="mr-2 h-4 w-4" /> Download
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg m-6 gap-4">
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Nenhum instrumento jurídico selecionado</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">Selecione um instrumento jurídico adequado para o seu projeto.</p>
                    </div>
                    <Button asChild>
                      <Link href={`/projetos/${project.slug}/legal-instrument`}>
                        <Scale className="mr-2 h-4 w-4" /> Selecionar Instrumento
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageShell>
  )
}

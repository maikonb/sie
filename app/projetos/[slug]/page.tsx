"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, FileText, Plus, Edit, Scale, Download, Eye, CheckCircle2, AlertCircle, SendHorizontal, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useProject } from "@/components/providers/project-context"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PageContent, PageHeader, PageHeaderHeading, PageShell } from "@/components/shell"
import { ProjectEditSheet } from "@/components/projects/project-edit-sheet"
import { DependencyCard } from "@/components/projects/dependency-card"
import { UserAvatar } from "@/components/user-avatar"
import { submitProjectForApproval } from "@/actions/projects"
import { toast } from "sonner"

export default function ProjectDetailsPage() {
  const router = useRouter()
  const { project, dependences, loading, view } = useProject()
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)


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

  const hasWorkPlan = !!workPlan
  const hasLegalInstruments = legalInstruments.length > 0
  const hasPendingInstruments = hasLegalInstruments && legalInstruments.some((li) => {
    const status = li.legalInstrumentInstance?.status || "DRAFT"
    return status === "DRAFT"
  })

  const canSubmit = view?.allowActions && hasWorkPlan && hasLegalInstruments && !hasPendingInstruments && project.status === "DRAFT"

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await submitProjectForApproval(project.slug!)
      toast.success("Projeto enviado para análise!")
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Erro ao enviar projeto")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1. Work Plan Dependency
  if (!workPlan) {
    missingDependencies.push({
      id: "work-plan",
      label: "Plano de Trabalho",
      description: "O plano de trabalho ainda não foi criado. É necessário definir metas e cronograma.",
      link: `/projetos/${project.slug}/work-plan`,
      action: "Criar Plano",
      icon: FileText,
    })
  }

  // 2. Legal Instrument Dependency
  if (legalInstruments.length === 0) {
    missingDependencies.push({
      id: "legal-instrument-select",
      label: "Instrumento Jurídico",
      description: "Nenhum instrumento jurídico foi selecionado para este projeto.",
      link: `/projetos/${project.slug}/legal-instrument`,
      action: "Selecionar",
      icon: Scale,
    })
  } else {
    const pendingInstruments = legalInstruments.filter((li) => {
      const status = li.legalInstrumentInstance?.status || "DRAFT"
      return status === "DRAFT"
    })

    pendingInstruments.forEach((li) => {
      missingDependencies.push({
        id: `legal-instrument-fill-${li.id}`,
        label: `Preencher ${li.legalInstrument.name}`,
        description: "O instrumento jurídico precisa ser preenchido para gerar o documento.",
        link: `/projetos/${project.slug}/legal-instrument/fill`,
        action: "Preencher",
        icon: Scale,
      })
    })
  }

  return (
    <PageShell>
      {/* Header */}
      <PageHeader className="flex-col items-start gap-4 md:flex-row md:items-start md:justify-between border-b">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Button variant="ghost" size="sm" asChild className="-ml-3 h-8 px-2 text-muted-foreground hover:text-foreground">
              <Link href="/projetos">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Projetos
              </Link>
            </Button>
          </div>
          <PageHeaderHeading className="text-3xl font-bold tracking-tight">{project.title}</PageHeaderHeading>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Criado em {format(new Date(project.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <span className="hidden md:inline">•</span>
            <Badge variant="outline" className={cn("font-normal", {
              "bg-muted text-muted-foreground": project.status === "DRAFT",
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400": project.status === "IN_ANALYSIS",
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400": project.status === "APPROVED",
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": project.status === "REJECTED",
            })}>
              {project.status === "DRAFT" && "Em Elaboração"}
              {project.status === "IN_ANALYSIS" && "Em Análise"}
              {project.status === "APPROVED" && "Aprovado"}
              {project.status === "REJECTED" && "Rejeitado"}
            </Badge>
            {project.approvedAt && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Aprovado em {format(new Date(project.approvedAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </>
            )}
            {project.status === "REJECTED" && project.rejectionReason && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="text-red-600 dark:text-red-400">Motivo: {project.rejectionReason}</span>
              </>
            )}
            {view?.mode !== "owner" && project.user && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-2">
                  <UserAvatar size="sm" preview={{ name: project.user.name, image: project.user.imageFile?.url, color: project.user.color }} />
                  <span>{project.user.name}</span>
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {view?.allowActions && project.status === "DRAFT" && (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !canSubmit}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <SendHorizontal className="mr-2 h-4 w-4" /> Enviar para Análise
                </>
              )}
            </Button>
          )}
          {view?.allowActions && (
            <Button onClick={() => setIsEditSheetOpen(true)}>
              <Edit className="mr-2 h-4 w-4" /> Editar Detalhes
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Content */}
      <PageContent>
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="workplan" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
              Plano de Trabalho
            </TabsTrigger>
            <TabsTrigger value="legal-instrument" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
              Instrumento Jurídico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-300">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Main Info */}
              <div className={cn("space-y-8", missingDependencies.length > 0 || (view?.allowActions && project.status === "DRAFT") ? "md:col-span-2" : "md:col-span-3")}>
                <section className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Objetivos
                  </h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.objectives || "Nenhum objetivo definido."}</div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold">Justificativa</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.justification || "Nenhuma justificativa definida."}</div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold">Abrangência</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.scope || "Nenhuma abrangência definida."}</div>
                </section>
              </div>

              {/* Sidebar */}
              {(missingDependencies.length > 0 || (view?.allowActions && project.status === "DRAFT")) && (
                <div className="space-y-4">
                  {missingDependencies.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 font-medium text-orange-600 dark:text-orange-400">
                        <AlertCircle className="h-5 w-5" />
                        Pendências do Projeto
                      </div>
                      {missingDependencies.map((dep) => (
                        <DependencyCard key={dep.id} title={dep.label} description={dep.description} icon={dep.icon} actionLabel={dep.action} actionLink={dep.link} variant="warning" readOnly={!view?.allowActions} />
                      ))}
                    </div>
                  )}

                  {!missingDependencies.length && view?.allowActions && project.status === "DRAFT" && (
                    <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <div>
                            <CardTitle className="text-base text-green-900 dark:text-green-300">Pronto para Submissão</CardTitle>
                            <CardDescription className="text-green-700 dark:text-green-400 mt-1">
                              Todas as dependências foram atendidas. Você pode enviar o projeto para análise.
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="workplan" className="animate-in fade-in-50 duration-300">
            {workPlan ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle>Plano de Trabalho</CardTitle>
                      <CardDescription>Criado em {format(new Date(workPlan.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</CardDescription>
                    </div>
                    {view?.allowActions && (
                      <Button variant="outline" asChild>
                        <Link href={`/projetos/${project.slug}/work-plan`}>
                          <Edit className="mr-2 h-4 w-4" /> Gerenciar Plano
                        </Link>
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border bg-muted/20">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" /> Objetivo Geral
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{workPlan.generalObjective}</p>
                        </div>

                        <div className="p-4 rounded-lg border bg-muted/20">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" /> Vigência
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {workPlan.validityStart ? format(new Date(workPlan.validityStart), "dd/MM/yyyy") : "Início não definido"}
                            {" - "}
                            {workPlan.validityEnd ? format(new Date(workPlan.validityEnd), "dd/MM/yyyy") : "Fim não definido"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {workPlan.methodology && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Metodologia</h4>
                            <p className="text-sm text-muted-foreground line-clamp-3">{workPlan.methodology}</p>
                          </div>
                        )}

                        {workPlan.expectedResults && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Resultados Esperados</h4>
                            <p className="text-sm text-muted-foreground line-clamp-3">{workPlan.expectedResults}</p>
                          </div>
                        )}

                        {workPlan.monitoring && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Monitoramento e Avaliação</h4>
                            <p className="text-sm text-muted-foreground line-clamp-3">{workPlan.monitoring}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Equipe Executora</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Em desenvolvimento</p>
                        {view?.allowActions && (
                          <Button variant="link" size="sm" asChild>
                            <Link href={`/projetos/${project.slug}/work-plan`}>Ver Equipe</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Cronograma</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Em desenvolvimento</p>
                        {view?.allowActions && (
                          <Button variant="link" size="sm" asChild>
                            <Link href={`/projetos/${project.slug}/work-plan`}>Ver Cronograma</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum plano de trabalho</h3>
                <p className="text-muted-foreground max-w-sm text-center mb-6">Crie um plano de trabalho para definir os objetivos, cronograma e equipe do projeto.</p>
                {view?.allowActions && (
                  <Button asChild>
                    <Link href={`/projetos/${project.slug}/work-plan`}>
                      <Plus className="mr-2 h-4 w-4" /> Criar Plano de Trabalho
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="legal-instrument" className="animate-in fade-in-50 duration-300">
            {legalInstruments.length > 0 ? (
              <div className="space-y-6">
                {/* Since the relationship is effectively 1:1 for the UI, we take the first one */}
                {(() => {
                  const li = legalInstruments[0]
                  const instance = li.legalInstrumentInstance
                  const instrument = li.legalInstrument
                  const hasAnswerFile = instance?.answerFile
                  const status = instance?.status || "DRAFT"
                  const isFilled = status !== "DRAFT"

                  return (
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Scale className="h-5 w-5" />
                              {instrument.name}
                            </CardTitle>
                            <Badge variant={status === "APPROVED" ? "default" : "secondary"} className={cn("px-3 py-1 text-sm", status === "SENT_FOR_ANALYSIS" && "bg-blue-500 hover:bg-blue-600", status === "APPROVED" && "bg-green-500 hover:bg-green-600", status === "REJECTED" && "bg-red-500 hover:bg-red-600")}>
                              {status === "SENT_FOR_ANALYSIS" && "Em Análise"}
                              {status === "APPROVED" && "Aprovado"}
                              {status === "REJECTED" && "Rejeitado"}
                              {status === "DRAFT" && "Rascunho"}
                            </Badge>
                          </div>
                          <CardDescription className="text-base mt-2">{instrument.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">Tipo de Instrumento</span>
                              <p className="font-medium">{instance.type || instrument.type}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">Data de Criação</span>
                              <p className="font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(instance.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">Última Atualização</span>
                              <p className="font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(instance.updatedAt), "dd/MM/yyyy 'às' HH:mm")}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">Status do Preenchimento</span>
                              <div className="flex items-center gap-2">
                                {isFilled ? (
                                  <span className="text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" /> Preenchido
                                  </span>
                                ) : (
                                  <span className="text-orange-600 font-medium flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" /> Pendente
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {hasAnswerFile && (
                            <div className="p-4 rounded-lg bg-muted/50 border">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Documento Gerado
                              </h4>
                              <div className="flex items-center justify-between bg-background p-3 rounded border">
                                <span className="text-sm truncate max-w-[200px] sm:max-w-md">{instance.answerFile.filename || "documento.pdf"}</span>
                                <Button size="sm" variant="ghost" asChild>
                                  <Link href={instance.answerFile.url} target="_blank">
                                    <Download className="h-4 w-4 mr-2" /> Baixar
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <div className="space-y-4">
                        {view?.allowActions && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Ações</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <Button className="w-full" variant={status === "DRAFT" ? "default" : "secondary"} asChild>
                                <Link href={`/projetos/${project.slug}/legal-instrument/fill`}>{status === "DRAFT" ? (isFilled ? "Editar Respostas" : "Preencher Formulário") : "Visualizar Respostas"}</Link>
                              </Button>

                              {hasAnswerFile && (
                                <Button className="w-full" variant="outline" asChild>
                                  <Link href={instance.answerFile.url} target="_blank">
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                  </Link>
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 text-sm">Informação Importante</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-400">Após o preenchimento e envio para análise, o instrumento não poderá ser alterado até que receba um parecer.</p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Scale className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum instrumento jurídico</h3>
                <p className="text-muted-foreground max-w-sm text-center mb-6">Selecione um instrumento jurídico adequado para o seu projeto.</p>
                {view?.allowActions && (
                  <Button asChild>
                    <Link href={`/projetos/${project.slug}/legal-instrument`}>
                      <Plus className="mr-2 h-4 w-4" /> Selecionar Instrumento
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageContent>

      <ProjectEditSheet
        project={{
          ...project,
          slug: project.slug || "",
        }}
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
      />
    </PageShell>
  )
}

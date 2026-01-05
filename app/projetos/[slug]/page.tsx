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
import { useProject } from "@/components/providers/project"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PageContent, PageHeader, PageHeaderHeading, PageShell } from "@/components/shell"
import { ProjectEditSheet } from "@/components/projects/edit-sheet"
import { DependencyCard } from "@/components/projects/dependency-card"
import { UserAvatar } from "@/components/user-avatar"
import { ProjectStatus, LegalInstrumentStatus } from "@prisma/client"
import { submitProjectForApproval } from "@/actions/projects"
import { notify } from "@/lib/notifications"
import type { LucideIcon } from "lucide-react"
import type { ProjectDependences } from "@/components/providers/project"
import type { LegalInstrumentFieldSpec } from "@/types/legal-instrument"
import { legalInstrumentTypeLabel } from "@/lib/utils/legal-instrument"

type MissingDependency = {
  id: string
  label: string
  description: string
  link: string
  action: string
  icon: LucideIcon
}

type ProjectLegalInstrumentInstance = NonNullable<ProjectDependences["legal-instrument"]>

const getErrorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message
    return typeof message === "string" ? message : undefined
  }
  return undefined
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

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
  const legalInstrumentInstance: ProjectLegalInstrumentInstance | null = dependences["legal-instrument"] ?? null

  const specificObjectives: any = workPlan?.specificObjectives
  console.log("specificObjectives: ", specificObjectives);
  console.log("workPlan: ", workPlan?.specificObjectives)

  // Calculate dependencies
  const missingDependencies: MissingDependency[] = []

  const hasWorkPlan = !!workPlan
  const hasLegalInstrument = !!legalInstrumentInstance
  const hasPendingInstrument = hasLegalInstrument && (legalInstrumentInstance.status || LegalInstrumentStatus.PENDING) !== LegalInstrumentStatus.FILLED

  const canSubmit = view?.allowActions && hasWorkPlan && hasLegalInstrument && !hasPendingInstrument && project.status === ProjectStatus.DRAFT

  // Mensagem de feedback para botão desabilitado
  const getSubmitDisabledReason = () => {
    if (project.status !== ProjectStatus.DRAFT) return "Projeto já foi enviado"
    if (!hasWorkPlan) return "É necessário criar o Plano de Trabalho"
    if (!hasLegalInstrument) return "É necessário selecionar um Instrumento Jurídico"
    if (hasPendingInstrument) return "É necessário preencher completamente o Instrumento Jurídico"
    return null
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await submitProjectForApproval(project.slug!)
      notify.success("Projeto enviado para análise!")
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      notify.error(getErrorMessage(error) ?? "Erro ao enviar projeto")
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
  if (!legalInstrumentInstance) {
    missingDependencies.push({
      id: "legal-instrument-select",
      label: "Instrumento Jurídico",
      description: "Instrumento jurídico ainda não foi selecionado para este projeto.",
      link: `/projetos/${project.slug}/legal-instrument`,
      action: "Selecionar",
      icon: Scale,
    })
  } else {
    if ((legalInstrumentInstance.status || LegalInstrumentStatus.PENDING) !== LegalInstrumentStatus.FILLED) {
      const instrumentName = legalInstrumentInstance.legalInstrumentVersion.legalInstrument.name
      missingDependencies.push({
        id: `legal-instrument-fill-${legalInstrumentInstance.id}`,
        label: `Preencher ${instrumentName}`,
        description: "O instrumento jurídico precisa ser preenchido para gerar o documento.",
        link: `/projetos/${project.slug}/legal-instrument/fill`,
        action: "Preencher",
        icon: Scale,
      })
    }
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
              "bg-muted text-muted-foreground": project.status === ProjectStatus.DRAFT,
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400": project.status === ProjectStatus.PENDING_REVIEW,
              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400": project.status === ProjectStatus.UNDER_REVIEW,
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400": project.status === ProjectStatus.APPROVED,
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": project.status === ProjectStatus.REJECTED,
            })}>
              {project.status === ProjectStatus.DRAFT && "Em Elaboração"}
              {project.status === ProjectStatus.PENDING_REVIEW && "Aguardando análise"}
              {project.status === ProjectStatus.UNDER_REVIEW && "Em análise"}
              {project.status === ProjectStatus.APPROVED && "Aprovado"}
              {project.status === ProjectStatus.REJECTED && "Rejeitado"}
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
            {project.status === ProjectStatus.REJECTED && project.rejectionReason && (
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
          {view?.allowActions && project.status === ProjectStatus.DRAFT && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
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
                  </div>
                </TooltipTrigger>
                {!canSubmit && getSubmitDisabledReason() && (
                  <TooltipContent>
                    <p className="text-sm">{getSubmitDisabledReason()}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
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
            <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
              Histórico
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
              <div className={cn("space-y-8", missingDependencies.length > 0 || (view?.allowActions && project.status === ProjectStatus.DRAFT) ? "md:col-span-2" : "md:col-span-3")}>
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
              {(missingDependencies.length > 0 || (view?.allowActions && project.status === ProjectStatus.DRAFT)) && (
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

                  {!missingDependencies.length && view?.allowActions && project.status === ProjectStatus.DRAFT && (
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

          <TabsContent value="history" className="animate-in fade-in-50 duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Histórico</CardTitle>
                <CardDescription>Registro de ações do projeto</CardDescription>
              </CardHeader>
              <CardContent>
                {!project.audits.length ? (
                  <div className="text-sm text-muted-foreground">Nenhuma ação registrada ainda.</div>
                ) : (
                  <div className="space-y-3">
                    {project.audits.map((a) => {
                      const reason =
                        isPlainObject(a.changeDetails) && typeof a.changeDetails.reason === "string" ? a.changeDetails.reason : undefined

                      return (
                        <div key={a.id} className="flex items-center gap-3 text-sm">
                          <div className="shrink-0 w-2 h-2 rounded-full bg-muted" />
                          <div className="flex-1">
                            <div className="font-medium">
                              {a.action === "SUBMITTED" && "Enviado para análise"}
                              {a.action === "APPROVED" && "Aprovado"}
                              {a.action === "REJECTED" && "Rejeitado"}
                              {!(["SUBMITTED", "APPROVED", "REJECTED"] as string[]).includes(a.action) && a.action}
                            </div>
                            <div className="text-muted-foreground">
                              {a.user?.name ? `por ${a.user.name}` : null}
                              {a.createdAt ? ` • ${format(new Date(a.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}` : null}
                            </div>
                            {reason && <div className="text-red-600 dark:text-red-400">Motivo: {reason}</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="workplan" className="animate-in fade-in-50 duration-300">
            {workPlan ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle>Plano de Trabalho</CardTitle>
                      <CardDescription>
                        Criado em {format(new Date(workPlan.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        {workPlan.updatedAt ? (
                          <> • Atualizado em {format(new Date(workPlan.updatedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</>
                        ) : null}
                      </CardDescription>
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
                      <div className="space-y-6">
                        <div className="rounded-lg border bg-muted/10">
                          <div className="p-4 border-b">
                            <h4 className="font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" /> Objetivos
                            </h4>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Objetivo Geral</div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workPlan.generalObjective}</p>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground">Objetivos Específicos</div>
                              {specificObjectives.length ? (
                                <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                                  {specificObjectives.map((objective: any, idx: any) => (
                                    <li key={`${idx}-${objective.value}`}>{objective.value}</li>
                                  ))}
                                </ol>
                              ) : (
                                <div className="text-sm text-muted-foreground">Não informado.</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border bg-muted/10">
                          <div className="p-4 border-b">
                            <h4 className="font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" /> Informações
                            </h4>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Vigência</div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  {workPlan.validityStart ? format(new Date(workPlan.validityStart), "dd/MM/yyyy") : "Início não definido"}
                                  {" - "}
                                  {workPlan.validityEnd ? format(new Date(workPlan.validityEnd), "dd/MM/yyyy") : "Fim não definido"}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Objeto</div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workPlan.object || "Não informado."}</p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Unidade Responsável</div>
                                <div className="text-sm text-muted-foreground">{workPlan.responsibleUnit || "Não informado."}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Gestor da ICT</div>
                                <div className="text-sm text-muted-foreground">{workPlan.ictManager || "Não informado."}</div>
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <div className="text-xs font-medium text-muted-foreground">Gestor do Parceiro</div>
                                <div className="text-sm text-muted-foreground">{workPlan.partnerManager || "Não informado."}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="rounded-lg border bg-muted/10">
                          <div className="p-4 border-b">
                            <h4 className="font-medium">Diagnóstico e Escopo</h4>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Diagnóstico</div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workPlan.diagnosis || "Não informado."}</p>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Justificativa</div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workPlan.planJustification || "Não informado."}</p>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Abrangência</div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workPlan.planScope || "Não informado."}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border bg-muted/10">
                          <div className="p-4 border-b">
                            <h4 className="font-medium">Metodologia e Resultados</h4>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Metodologia</div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workPlan.methodology || "Não informado."}</p>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Resultados Esperados</div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workPlan.expectedResults || "Não informado."}</p>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Monitoramento e Avaliação</div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workPlan.monitoring || "Não informado."}</p>
                            </div>
                          </div>
                        </div>
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
            {legalInstrumentInstance ? (
              <div className="space-y-6">
                {(() => {
                  const instance = legalInstrumentInstance
                  const instrument = instance.legalInstrumentVersion.legalInstrument
                  const filledFile = instance.filledFile ?? null
                  const status = instance.status || LegalInstrumentStatus.PENDING
                  const isFilled = status === LegalInstrumentStatus.FILLED

                  const answers = (instance.answers ?? {}) as unknown as Record<string, unknown>
                  const fields = ((instance.legalInstrumentVersion.fieldsJson ?? []) as unknown as LegalInstrumentFieldSpec[])
                  const requiredFields = fields.filter((f) => f.required)

                  const isAnswered = (fieldId: string) => {
                    const val = answers[fieldId]
                    return val !== undefined && val !== null && String(val).trim() !== ""
                  }

                  const requiredFilledCount = requiredFields.filter((f) => isAnswered(f.id)).length
                  const requiredTotalCount = requiredFields.length
                  const requiredProgress = requiredTotalCount > 0 ? requiredFilledCount / requiredTotalCount : 1

                  const actionLabel =
                    status === LegalInstrumentStatus.FILLED
                      ? "Visualizar Respostas"
                      : status === LegalInstrumentStatus.PARTIAL
                        ? "Editar Respostas"
                        : "Preencher Formulário"

                  return (
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Scale className="h-5 w-5" />
                              {instrument.name}
                              <span className="text-xs font-normal text-muted-foreground">v{instance.legalInstrumentVersion.version}</span>
                            </CardTitle>
                            <Badge
                              variant={status === LegalInstrumentStatus.FILLED ? "default" : "secondary"}
                              className={cn("px-3 py-1 text-sm", status === LegalInstrumentStatus.FILLED && "bg-green-500 hover:bg-green-600")}
                            >
                              {status === LegalInstrumentStatus.FILLED && "Preenchido"}
                              {status === LegalInstrumentStatus.PARTIAL && "Preenchido Parcialmente"}
                              {status === LegalInstrumentStatus.PENDING && "Não preenchido"}
                            </Badge>
                          </div>
                          <CardDescription className="text-base mt-2">{instrument.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid gap-4 sm:grid-cols-2">
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
                          </div>

                          <div className="p-4 rounded-lg bg-muted/30 border space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <h4 className="font-medium text-sm">Progresso do formulário</h4>
                                <p className="text-xs text-muted-foreground">
                                  {requiredTotalCount > 0 ? (
                                    <>
                                      Obrigatórios preenchidos: {requiredFilledCount}/{requiredTotalCount}
                                    </>
                                  ) : (
                                    <>Sem campos obrigatórios.</>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-muted-foreground">
                                  {legalInstrumentTypeLabel(instance.legalInstrumentVersion.type)}
                                </Badge>
                              </div>
                            </div>

                            {requiredTotalCount > 0 && (
                              <div className="space-y-2">
                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                  <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.round(requiredProgress * 100)}%` }} />
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{Math.round(requiredProgress * 100)}% concluído</span>
                                  <span>{requiredTotalCount} obrigatório(s)</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {filledFile && (
                            <div className="p-4 rounded-lg bg-muted/50 border">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Documento Gerado
                              </h4>
                              <div className="flex items-center justify-between bg-background p-3 rounded border">
                                <span className="text-sm truncate max-w-[200px] sm:max-w-md">{filledFile.filename || "documento.pdf"}</span>
                                <Button size="sm" variant="ghost" asChild>
                                  <Link href={filledFile.url} target="_blank">
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
                              <Button className="w-full" variant={status === LegalInstrumentStatus.PENDING ? "default" : "secondary"} asChild>
                                <Link href={`/projetos/${project.slug}/legal-instrument/fill`}>{actionLabel}</Link>
                              </Button>

                              {filledFile && (
                                <Button className="w-full" variant="outline" asChild>
                                  <Link href={filledFile.url} target="_blank">
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                  </Link>
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {(() => {
                          const templateFile = instance.legalInstrumentVersion.templateFile
                          if (!templateFile) return null

                          const isPdf = templateFile.contentType?.includes("pdf") || templateFile.filename?.toLowerCase().endsWith(".pdf")
                          const isDoc =
                            templateFile.contentType?.includes("word") ||
                            templateFile.contentType?.includes("msword") ||
                            templateFile.filename?.toLowerCase().endsWith(".doc") ||
                            templateFile.filename?.toLowerCase().endsWith(".docx")

                          const directUrl = templateFile.url
                          const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(directUrl)}`
                          const previewUrl = isPdf ? directUrl : isDoc ? officeViewerUrl : directUrl

                          return (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Template</CardTitle>
                                <CardDescription>Visualização do modelo usado para gerar o documento.</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <Button className="w-full" variant="outline" asChild>
                                  <Link href={directUrl} target="_blank">
                                    <Eye className="mr-2 h-4 w-4" /> Abrir em nova aba
                                  </Link>
                                </Button>

                                {isPdf && (
                                  <div className="rounded-lg overflow-hidden border bg-background">
                                    <iframe title="Template (PDF)" src={previewUrl} className="w-full h-[520px]" />
                                  </div>
                                )}

                                {isDoc && (
                                  <div className="rounded-lg overflow-hidden border bg-background">
                                    <iframe title="Template (DOC/DOCX)" src={previewUrl} className="w-full h-[520px]" />
                                    <p className="text-xs text-muted-foreground px-3 py-2 border-t bg-muted/20">
                                      Se o preview não carregar, a URL do arquivo pode não ser pública. Use “Abrir em nova aba”.
                                    </p>
                                  </div>
                                )}

                                {!isPdf && !isDoc && (
                                  <p className="text-sm text-muted-foreground">Formato não suportado para pré-visualização.</p>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })()}

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
                <h3 className="text-lg font-semibold mb-2">Instrumento jurídico ainda não selecionado</h3>
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

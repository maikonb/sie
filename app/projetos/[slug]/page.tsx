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
import { toast } from "sonner"
import type { LucideIcon } from "lucide-react"
import type { ProjectDependences } from "@/components/providers/project"

type MissingDependency = {
  id: string
  label: string
  description: string
  link: string
  action: string
  icon: LucideIcon
}

type ProjectLegalInstrumentRelation = NonNullable<ProjectDependences["legal-instrument"]>[number]

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
  const legalInstruments: ProjectLegalInstrumentRelation[] = dependences["legal-instrument"] ?? []

  // Calculate dependencies
  const missingDependencies: MissingDependency[] = []

  const hasWorkPlan = !!workPlan
  const hasLegalInstruments = legalInstruments.length > 0
  const hasPendingInstruments = hasLegalInstruments && legalInstruments.some((li) => {
    const status = li.legalInstrumentInstance?.status || LegalInstrumentStatus.PENDING
    return status !== LegalInstrumentStatus.FILLED
  })

  const canSubmit = view?.allowActions && hasWorkPlan && hasLegalInstruments && !hasPendingInstruments && project.status === ProjectStatus.DRAFT

  // Mensagem de feedback para botão desabilitado
  const getSubmitDisabledReason = () => {
    if (project.status !== ProjectStatus.DRAFT) return "Projeto já foi enviado"
    if (!hasWorkPlan) return "É necessário criar o Plano de Trabalho"
    if (!hasLegalInstruments) return "É necessário selecionar um Instrumento Jurídico"
    if (hasPendingInstruments) return "É necessário preencher completamente o Instrumento Jurídico"
    return null
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await submitProjectForApproval(project.slug!)
      toast.success("Projeto enviado para análise!")
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      toast.error(getErrorMessage(error) ?? "Erro ao enviar projeto")
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
    const pendingInstruments = project.legalInstruments.filter((li) => {
      const status = li.legalInstrumentInstance?.status || "PENDING"
      return status !== LegalInstrumentStatus.FILLED
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
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status do projeto</CardTitle>
                  <CardDescription>Progresso e datas principais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("font-normal", {
                      "bg-muted text-muted-foreground": project.status === ProjectStatus.DRAFT,
                      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400": project.status === ProjectStatus.PENDING_REVIEW,
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400": project.status === ProjectStatus.UNDER_REVIEW,
                      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400": project.status === ProjectStatus.APPROVED,
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": project.status === ProjectStatus.REJECTED,
                    })}>
                      {project.status === ProjectStatus.DRAFT && "Em elaboração"}
                      {project.status === ProjectStatus.PENDING_REVIEW && "Aguardando análise"}
                      {project.status === ProjectStatus.UNDER_REVIEW && "Em análise"}
                      {project.status === ProjectStatus.APPROVED && "Aprovado"}
                      {project.status === ProjectStatus.REJECTED && "Rejeitado"}
                    </Badge>
                    {project.submittedAt && <span>• Enviado em {format(new Date(project.submittedAt), "dd/MM/yyyy", { locale: ptBR })}</span>}
                  </div>
                  {project.approvedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Aprovado em {format(new Date(project.approvedAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  )}
                  {project.status === ProjectStatus.REJECTED && project.rejectionReason && (
                    <div className="text-red-600 dark:text-red-400">Motivo: {project.rejectionReason}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Proponente</CardTitle>
                  <CardDescription>Responsável pelo projeto</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-3 text-sm">
                  <UserAvatar size="sm" preview={{ name: project.user?.name, image: project.user?.imageFile?.url, color: project.user?.color }} />
                  <div className="space-y-1">
                    <div className="font-medium">{project.user?.name ?? "Usuário"}</div>
                    {project.user?.email && <div className="text-muted-foreground">{project.user.email}</div>}
                  </div>
                </CardContent>
              </Card>
            </div>

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
                  const answerFile = instance?.answerFile ?? null
                  const status = instance?.status || LegalInstrumentStatus.PENDING
                  const isFilled = status !== LegalInstrumentStatus.PENDING

                  return (
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Scale className="h-5 w-5" />
                              {instrument.name}
                            </CardTitle>
                            <Badge
                              variant={status === LegalInstrumentStatus.FILLED ? "default" : "secondary"}
                              className={cn("px-3 py-1 text-sm", status === LegalInstrumentStatus.FILLED && "bg-green-500 hover:bg-green-600")}
                            >
                              {status === LegalInstrumentStatus.FILLED && "Aprovado"}
                              {status === LegalInstrumentStatus.PENDING && "Rascunho"}
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

                          {answerFile && (
                            <div className="p-4 rounded-lg bg-muted/50 border">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Documento Gerado
                              </h4>
                              <div className="flex items-center justify-between bg-background p-3 rounded border">
                                <span className="text-sm truncate max-w-[200px] sm:max-w-md">{answerFile.filename || "documento.pdf"}</span>
                                <Button size="sm" variant="ghost" asChild>
                                  <Link href={answerFile.url} target="_blank">
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
                                <Link href={`/projetos/${project.slug}/legal-instrument/fill`}>{status === LegalInstrumentStatus.PENDING ? (isFilled ? "Editar Respostas" : "Preencher Formulário") : "Visualizar Respostas"}</Link>
                              </Button>

                              {answerFile && (
                                <Button className="w-full" variant="outline" asChild>
                                  <Link href={answerFile.url} target="_blank">
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

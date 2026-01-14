"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { legalInstrumentTypeLabel } from "@/lib/utils/legal-instrument"
import { ArrowLeft, Calendar, FileText, CheckCircle2, XCircle, AlertCircle, Loader2, Scale, Download } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { notify } from "@/lib/notifications"
import { approveProject, rejectProject, startProjectReview, requestProjectAdjustments } from "@/actions/projects"
import { useProject } from "@/components/providers/project"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserAvatar } from "@/components/user-avatar"
import { ProjectStatus } from "@prisma/client"
import { PageHeader, PageShell, PageBack, PageHeaderHeading } from "@/components/shell"
import { ProjectStatusBadge } from "@/components/projects/status-badge"

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

export default function ProjectReviewPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { project, loading } = useProject()

  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isStartingReview, setIsStartingReview] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const [isReturning, setIsReturning] = useState(false)
  const [returnReason, setReturnReason] = useState("")
  const [showReturnDialog, setShowReturnDialog] = useState(false)

  if (loading) {
    return (
      <div className="max-w-5xl w-full mx-auto py-8 space-y-8">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!project) return null

  const workPlan = project.workPlan
  const legalInstruments = project.legalInstrumentInstance ? [project.legalInstrumentInstance] : []

  const handleStartReview = async () => {
    try {
      setIsStartingReview(true)
      await startProjectReview(slug)
      notify.success("Análise iniciada com sucesso!")
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      notify.error(getErrorMessage(error) ?? "Erro ao iniciar análise")
    } finally {
      setIsStartingReview(false)
    }
  }

  const handleApprove = async () => {
    try {
      setIsApproving(true)
      await approveProject(slug)
      notify.success("Projeto aprovado com sucesso!")
      router.push("/admin/projetos")
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      notify.error(getErrorMessage(error) ?? "Erro ao aprovar projeto")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      notify.error("Motivo da rejeição é obrigatório")
      return
    }

    try {
      setIsRejecting(true)
      await rejectProject(slug, rejectReason)
      notify.success("Projeto rejeitado")
      router.push("/admin/projetos")
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      notify.error(getErrorMessage(error) ?? "Erro ao rejeitar projeto")
    } finally {
      setIsRejecting(false)
      setShowRejectDialog(false)
    }
  }

  const handleRequestAdjustments = async () => {
    if (!returnReason.trim()) {
      notify.error("Motivo dos ajustes é obrigatório")
      return
    }

    try {
      setIsReturning(true)
      await requestProjectAdjustments(slug, returnReason)
      notify.success("Solicitação de ajustes enviada")
      router.push("/admin/projetos")
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      notify.error(getErrorMessage(error) ?? "Erro ao solicitar ajustes")
    } finally {
      setIsReturning(false)
      setShowReturnDialog(false)
    }
  }

  return (
    <PageShell>
      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between w-full">
          <div className="items-start justify-between gap-4">
            <PageBack href="/admin/projetos">Voltar para Aprovações</PageBack>
            <div className="space-y-2 flex-1">
              <PageHeaderHeading className="text-3xl font-bold tracking-tight">{project.title}</PageHeaderHeading>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Enviado em {format(new Date(project.submittedAt || project.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                <ProjectStatusBadge status={project.status} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {project.status === ProjectStatus.PENDING_REVIEW && (
              <Button onClick={handleStartReview} disabled={isStartingReview} size="lg" className="bg-blue-600 hover:bg-blue-700">
                {isStartingReview ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" /> Iniciar Análise
                  </>
                )}
              </Button>
            )}

            {project.status === ProjectStatus.UNDER_REVIEW && (
              <>
                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="lg">
                      <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rejeitar Projeto</DialogTitle>
                      <DialogDescription>Forneça um motivo claro para a rejeição do projeto.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea placeholder="Motivo da rejeição..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="min-h-[120px]" />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                          Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isRejecting || !rejectReason.trim()}>
                          {isRejecting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejeitando...
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-2 h-4 w-4" /> Confirmar Rejeição
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button onClick={handleApprove} disabled={isApproving} size="lg" className="bg-green-600 hover:bg-green-700">
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aprovando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </PageHeader>

      {/* Proposer Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informações do Proponente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <UserAvatar
              size="lg"
              preview={{
                name: project.user?.name || "Usuário",
                image: project.user?.imageFile?.url,
                color: project.user?.color,
              }}
            />
            <div>
              <p className="font-semibold">{project.user?.name || "Sem nome"}</p>
              <p className="text-sm text-muted-foreground">{project.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Content */}
      <Tabs defaultValue="overview" className="space-y-6">
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

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
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

            {/* Checklist */}
            <div className="md:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base">Checklist de Aprovação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Detalhes do Projeto</p>
                      <p className="text-xs text-muted-foreground">Preenchidos corretamente</p>
                    </div>
                  </div>

                  <div className={cn("flex items-start gap-3", workPlan ? "opacity-100" : "opacity-50")}>
                    {workPlan ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Plano de Trabalho</p>
                      <p className="text-xs text-muted-foreground">{workPlan ? "Criado" : "Não encontrado"}</p>
                    </div>
                  </div>

                  <div className={cn("flex items-start gap-3", legalInstruments.length > 0 ? "opacity-100" : "opacity-50")}>
                    {legalInstruments.length > 0 ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Instrumento Jurídico</p>
                      <p className="text-xs text-muted-foreground">{legalInstruments.length > 0 ? "Preenchido" : "Não encontrado"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        {/* Workplan Tab */}
        <TabsContent value="workplan" className="space-y-6">
          {workPlan ? (
            <div className="space-y-8">
              {/* General Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">Objetivo Geral</h4>
                      <p className="text-sm">{workPlan.generalObjective || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">Metodologia</h4>
                      <p className="text-sm">{workPlan.methodology || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">Monitoramento</h4>
                      <p className="text-sm">{workPlan.monitoring || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">Resultados Esperados</h4>
                      <p className="text-sm">{workPlan.expectedResults || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Metas Específicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(workPlan.specificObjectives) && workPlan.specificObjectives.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2 text-sm">
                        {(workPlan.specificObjectives as string[]).map((obj, i) => (
                          <li key={i} className="text-muted-foreground">
                            {typeof obj === "string" ? obj : JSON.stringify(obj)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma meta específica definida.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cronograma de Execução</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* @ts-ignore - Assuming schedule exists due to validator update */}
                  {workPlan.schedule && workPlan.schedule.length > 0 ? (
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                          <tr>
                            <th className="px-4 py-3 font-medium">Eixo/Meta</th>
                            <th className="px-4 py-3 font-medium">Ação/Etapa</th>
                            <th className="px-4 py-3 font-medium">Indicador</th>
                            <th className="px-4 py-3 font-medium">Período</th>
                            <th className="px-4 py-3 font-medium">Responsável</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {/* @ts-ignore */}
                          {workPlan.schedule.map((item: any) => (
                            <tr key={item.id} className="bg-background">
                              <td className="px-4 py-3 font-medium">{item.axisGoal}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.actionStep}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.indicator}</td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {format(new Date(item.startDate), "dd/MM/yy")} - {format(new Date(item.endDate), "dd/MM/yy")}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{item.responsible}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum cronograma definido.</p>
                  )}
                </CardContent>
              </Card>

              {/* Team & Participants */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Equipe Executora</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* @ts-ignore */}
                    {workPlan.team && workPlan.team.length > 0 ? (
                      <div className="space-y-4">
                        {/* @ts-ignore */}
                        {workPlan.team.map((member: any) => (
                          <div key={member.id} className="flex flex-col space-y-1 pb-3 border-b last:border-0 last:pb-0">
                            <p className="font-medium text-sm">{member.name}</p>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>{member.role}</span>
                              {member.institution && (
                                <>
                                  <span>•</span>
                                  <span>{member.institution}</span>
                                </>
                              )}
                              {member.weeklyHours && (
                                <>
                                  <span>•</span>
                                  <span>{member.weeklyHours}h/sem</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma equipe definida.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Parceiros Envolvidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* @ts-ignore */}
                    {workPlan.participants && workPlan.participants.length > 0 ? (
                      <div className="space-y-4">
                        {/* @ts-ignore */}
                        {workPlan.participants.map((part: any) => (
                          <div key={part.id} className="flex flex-col space-y-1 pb-3 border-b last:border-0 last:pb-0">
                            <p className="font-medium text-sm">{part.entityOrg}</p>
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                              {part.contact && <span>Contato: {part.contact}</span>}
                              {part.authorityName && <span>Resp: {part.authorityName}</span>}
                              {part.address && <span className="italic truncate">{part.address}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum parceiro definido.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum plano de trabalho foi criado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Legal Instrument Tab */}
        <TabsContent value="legal-instrument" className="space-y-6">
          {legalInstruments.length > 0 ? (
            <div className="space-y-6">
              {legalInstruments.map((li) => {
                const filledFile = li.filledFile ?? null
                const isFullyFilled = li.status === "FILLED" // Assuming status enum match
                const answers = (li.answers ?? {}) as Record<string, unknown>

                return (
                  <div key={li.id} className="grid gap-6 lg:grid-cols-12 items-stretch">
                    {/* Header Status Card */}
                    <Card className="overflow-hidden border-none col-span-12 lg:col-span-7 shadow-md bg-linear-to-br from-card to-muted/30">
                      <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Scale className="h-5 w-5" />
                              </div>
                              <CardTitle className="text-xl">{li.legalInstrumentVersion.legalInstrument.name}</CardTitle>
                            </div>
                            <CardDescription className="text-xs font-medium flex items-center gap-2">{legalInstrumentTypeLabel(li.legalInstrumentVersion.type)}</CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className={cn("px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs", li.status === "FILLED" && "bg-green-500 hover:bg-green-600 border-none text-white", li.status === "PARTIAL" && "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900", li.status === "PENDING" && "bg-muted text-muted-foreground")}>
                              {li.status === "FILLED" ? "Completo" : li.status === "PARTIAL" ? "Em Progresso" : "Pendente"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <div className="px-6 pb-6">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-background border shadow-sm">
                            <CheckCircle2 className={cn("h-5 w-5", li.status === "FILLED" ? "text-green-500" : "text-muted-foreground")} />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Status do Preenchimento</h4>
                            <p className="text-xs text-muted-foreground">{li.status === "FILLED" ? "Todas as informações foram preenchidas." : "Aguardando conclusão pelo proponente."}</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Download Card */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                      {filledFile ? (
                        <Card className="border-green-500/20 bg-green-500/5 shadow-inner h-full">
                          <CardContent className="p-6 flex flex-col justify-center h-full gap-4">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                                <FileText className="h-8 w-8" />
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="font-bold text-green-900 dark:text-green-300">Minuta Disponível</h4>
                                <p className="text-xs text-muted-foreground">Versão mais recente gerada.</p>
                              </div>
                            </div>
                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 shadow-sm" asChild>
                              <Link href={filledFile.url} target="_blank">
                                <Download className="h-4 w-4 mr-2" /> Baixar PDF
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="border-dashed h-full">
                          <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center space-y-2">
                            <FileText className="h-8 w-8 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">Minuta ainda não gerada.</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Answers Grid */}
                    {Object.keys(answers).length > 0 && (
                      <Card className="col-span-12">
                        <CardHeader>
                          <CardTitle className="text-base">Dados Preenchidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(answers).map(([key, value]) => (
                              <div key={key} className="p-3 bg-muted/30 rounded-lg border space-y-1">
                                <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider truncate" title={key}>
                                  {key}
                                </p>
                                <p className="text-sm font-medium text-foreground break-all line-clamp-3" title={String(value)}>
                                  {String(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <Link href="/admin/projetos" className="cursor-default">
                    <Scale className="h-8 w-8 text-muted-foreground/50" />
                  </Link>
                </div>
                <p className="text-muted-foreground font-medium">Instrumento jurídico não associado</p>
                <p className="text-xs text-muted-foreground mt-1">Este projeto ainda não possui definições jurídicas.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" asChild>
          <Link href="/admin/projetos">Cancelar</Link>
        </Button>
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive">Rejeitar Projeto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Projeto</DialogTitle>
              <DialogDescription>Forneça um motivo claro para a rejeição do projeto.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea placeholder="Motivo da rejeição..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="min-h-[120px]" />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={isRejecting || !rejectReason.trim()}>
                  {isRejecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejeitando...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" /> Confirmar Rejeição
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700">
              Solicitar Ajustes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Ajustes</DialogTitle>
              <DialogDescription>Descreva quais alterações o proponente precisa realizar para que o projeto possa ser aprovado.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea placeholder="Descreva os ajustes necessários..." value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="min-h-[120px]" />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
                  Cancelar
                </Button>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleRequestAdjustments} disabled={isReturning || !returnReason.trim()}>
                  {isReturning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" /> Enviar Solicitação
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button onClick={handleApprove} disabled={isApproving} className="bg-green-600 hover:bg-green-700">
          {isApproving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aprovando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar Projeto
            </>
          )}
        </Button>
      </div>
    </PageShell>
  )
}

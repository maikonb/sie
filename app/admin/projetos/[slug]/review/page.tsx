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
import { ArrowLeft, Calendar, FileText, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { notify } from "@/lib/notifications"
import { approveProject, rejectProject, startProjectReview } from "@/actions/projects"
import { useProject } from "@/components/providers/project"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserAvatar } from "@/components/user-avatar"
import { ProjectStatus } from "@prisma/client"
import { PageHeader, PageShell } from "@/components/shell"
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

  return (
    <PageShell>
      {/* Header */}
      <PageHeader>
        <div className="items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Button variant="ghost" size="sm" asChild className="-ml-3 h-8 px-2">
              <Link href="/admin/projetos">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Aprovações
              </Link>
            </Button>
          </div>
          <div className="space-y-2 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Enviado em {format(new Date(project.submittedAt || project.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
              <ProjectStatusBadge status={project.status} />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{project.objectives}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Justificativa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{project.justification}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Abrangência</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{project.scope}</p>
                </CardContent>
              </Card>
            </div>

            {/* Checklist */}
            <div>
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

                  <div className={`flex items-start gap-3 ${workPlan ? "opacity-100" : "opacity-50"}`}>
                    {workPlan ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Plano de Trabalho</p>
                      <p className="text-xs text-muted-foreground">{workPlan ? "Criado" : "Não encontrado"}</p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 ${legalInstruments.length > 0 ? "opacity-100" : "opacity-50"}`}>
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
            <Card>
              <CardHeader>
                <CardTitle>Plano de Trabalho</CardTitle>
                <CardDescription>Criado em {format(new Date(workPlan.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {workPlan.generalObjective && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Objetivo Geral</h4>
                      <p className="text-sm text-muted-foreground">{workPlan.generalObjective}</p>
                    </div>
                  )}

                  {workPlan.methodology && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Metodologia</h4>
                      <p className="text-sm text-muted-foreground">{workPlan.methodology}</p>
                    </div>
                  )}

                  {workPlan.expectedResults && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Resultados Esperados</h4>
                      <p className="text-sm text-muted-foreground">{workPlan.expectedResults}</p>
                    </div>
                  )}

                  {workPlan.monitoring && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Monitoramento e Avaliação</h4>
                      <p className="text-sm text-muted-foreground">{workPlan.monitoring}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
            <div className="grid gap-4">
              {legalInstruments.map((li) => (
                <Card key={li.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">{li.legalInstrumentVersion.legalInstrument.name}</CardTitle>
                        <CardDescription>{li.legalInstrumentVersion.legalInstrument.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {legalInstrumentTypeLabel(li.legalInstrumentVersion.type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Status:</span> {li.status || "N/A"}
                      </p>
                    </div>

                    {li.answers && Object.keys(li.answers as Record<string, unknown>).length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Respostas Preenchidas</h4>
                        <div className="space-y-2 text-sm">
                          {isPlainObject(li.answers) &&
                            Object.entries(li.answers).map(([key, value]) => (
                              <div key={key} className="p-2 bg-muted/30 rounded">
                                <p className="font-medium text-xs text-muted-foreground uppercase">{key}</p>
                                <p className="text-foreground">{String(value)}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Instrumento jurídico ainda não associado</p>
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

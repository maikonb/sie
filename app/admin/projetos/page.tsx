import { getProjectsForApproval, getProjectApprovalStats } from "@/actions/projects"
import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, Clock, XCircle, BarChart3, ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageContent, PageHeader, PageHeaderDescription, PageHeaderHeading, PageShell } from "@/components/shell"
import { UserAvatar } from "@/components/user-avatar"

export default async function ProjectsApprovalPage() {
  let projects = []
  let stats = null

  try {
    projects = await getProjectsForApproval()
    stats = await getProjectApprovalStats()
  } catch (err) {
    console.error(err)
    return notFound()
  }

  const pendingProjects = projects.filter((p) => p.status === "IN_ANALYSIS")

  return (
    <PageShell>
      <PageHeader>
        <div className="space-y-1">
          <PageHeaderHeading>Aprovação de Projetos</PageHeaderHeading>
          <PageHeaderDescription>Revise e aprove projetos submetidos pelos usuários.</PageHeaderDescription>
        </div>
      </PageHeader>

      <PageContent>
        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inAnalysis}</div>
                <p className="text-xs text-muted-foreground">projetos aguardando análise</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">projetos aprovados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">projetos rejeitados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">projetos no sistema</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects List */}
        {pendingProjects.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Projetos em Análise</h2>
              <span className="text-sm text-muted-foreground">{pendingProjects.length} projeto(s)</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingProjects.map((project) => (
                <Link key={project.id} href={`/admin/projetos/${project.slug}/review`} className="group block h-full">
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                          <Clock className="mr-1 h-3 w-3" />
                          Em Análise
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {project.submittedAt
                            ? formatDistanceToNow(new Date(project.submittedAt), { addSuffix: true, locale: ptBR })
                            : "N/A"}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">{project.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-4">
                      {/* Proposer Info */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <UserAvatar
                          size="sm"
                          preview={{
                            name: project.user.name || "Sem nome",
                            image: project.user.imageFile?.url,
                            color: project.user.color,
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{project.user.name || "Usuário"}</p>
                          <p className="text-xs text-muted-foreground truncate">{project.user.email}</p>
                        </div>
                      </div>

                      {/* Dependencies Status */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Status das Dependências</h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${project.workPlan ? "bg-green-500" : "bg-red-500"}`}></div>
                            <span className={project.workPlan ? "text-foreground" : "text-muted-foreground"}>Plano de Trabalho</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${project.legalInstruments?.length > 0 ? "bg-green-500" : "bg-red-500"}`}></div>
                            <span className={project.legalInstruments?.length > 0 ? "text-foreground" : "text-muted-foreground"}>Instrumento Jurídico</span>
                          </div>
                        </div>
                      </div>

                      {/* Instruments List */}
                      {project.legalInstruments && project.legalInstruments.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Instrumentos</h4>
                          <div className="space-y-1">
                            {project.legalInstruments.map((li) => (
                              <div key={li.id} className="flex items-center justify-between text-xs">
                                <span className="truncate">{li.legalInstrument.name}</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    li.legalInstrumentInstance?.status === "SENT_FOR_ANALYSIS"
                                      ? "bg-blue-500/10 text-blue-600 border-blue-200"
                                      : li.legalInstrumentInstance?.status === "APPROVED"
                                        ? "bg-green-500/10 text-green-600 border-green-200"
                                        : "bg-muted text-muted-foreground"
                                  }
                                >
                                  {li.legalInstrumentInstance?.status === "SENT_FOR_ANALYSIS" && "Em Análise"}
                                  {li.legalInstrumentInstance?.status === "APPROVED" && "Aprovado"}
                                  {li.legalInstrumentInstance?.status === "REJECTED" && "Rejeitado"}
                                  {li.legalInstrumentInstance?.status === "DRAFT" && "Rascunho"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <div className="px-6 py-4 border-t bg-muted/20">
                      <Button variant="ghost" className="w-full justify-between text-primary hover:bg-primary/10">
                        Revisar Projeto
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Nenhum projeto pendente</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Parabéns! Todos os projetos foram analisados.</p>
          </div>
        )}
      </PageContent>
    </PageShell>
  )
}

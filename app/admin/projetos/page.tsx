import { getProjectsForApproval, getUserProjectStats } from "@/actions/projects"
import { notFound, redirect } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, Clock, XCircle, BarChart3, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ProjectStatus, LegalInstrumentStatus } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageContent, PageHeader, PageHeaderDescription, PageHeaderHeading, PageSecondaryHeader, PageShell } from "@/components/shell"
import { UserAvatar } from "@/components/user-avatar"
import { ProjectsApprovalToolbar } from "@/components/admin/projects/approval-toolbar"
import { getProjectsApprovalDefaultQueryParams } from "@/components/admin/projects/approval-toolbar/default"

const statusUi = {
  [ProjectStatus.DRAFT]: {
    label: "Rascunho",
    badgeClass: "bg-muted text-muted-foreground border-border",
    Icon: Clock,
  },
  [ProjectStatus.PENDING_REVIEW]: {
    label: "Pendente",
    badgeClass: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    Icon: Clock,
  },
  [ProjectStatus.UNDER_REVIEW]: {
    label: "Em Revisão",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-200",
    Icon: Clock,
  },
  [ProjectStatus.APPROVED]: {
    label: "Aprovado",
    badgeClass: "bg-green-500/10 text-green-600 border-green-200",
    Icon: CheckCircle2,
  },
  [ProjectStatus.REJECTED]: {
    label: "Rejeitado",
    badgeClass: "bg-red-500/10 text-red-600 border-red-200",
    Icon: XCircle,
  },
} as const

export default async function ProjectsApprovalPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  let projects = []
  let stats = null

  if (searchParams.defaults !== "1") {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined) continue
      if (Array.isArray(value)) value.forEach((v) => params.append(key, v))
      else params.set(key, value)
    }

    const defaults = getProjectsApprovalDefaultQueryParams()
    for (const [key, value] of Object.entries(defaults)) {
      if (params.has(key)) continue

      if (Array.isArray(value)) value.forEach((v) => params.append(key, v))
      else params.set(key, value)
    }

    params.set("defaults", "1")

    redirect(`/admin/projetos?${params.toString()}`)
  }

  const hasActiveFilters = Object.entries(searchParams).some(([key, value]) => {
    if (key === "sort" || key === "defaults") return false
    if (value === undefined) return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === "string") return value.trim().length > 0
    return false
  })

  // Extract filters from searchParams
  const filters = {
    search: typeof searchParams.search === "string" ? searchParams.search : undefined,
    status: typeof searchParams.status === "string" ? [searchParams.status] : Array.isArray(searchParams.status) ? searchParams.status : undefined,
    assignedToMe: searchParams.assignedToMe === "true",
    hasWorkPlan: searchParams.hasWorkPlan === "true",
    missingWorkPlan: searchParams.missingWorkPlan === "true",
    hasLegalInstrument: searchParams.hasLegalInstrument === "true",
    missingLegalInstrument: searchParams.missingLegalInstrument === "true",
    dateStart: typeof searchParams.dateStart === "string" ? searchParams.dateStart : undefined,
    dateEnd: typeof searchParams.dateEnd === "string" ? searchParams.dateEnd : undefined,
    sort: typeof searchParams.sort === "string" ? searchParams.sort : undefined,
    page: typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1,
  }

  try {
    const response = await getProjectsForApproval(filters)
    projects = response.data
    const totalCount = response.total
    const pageCount = response.pageCount
    const currentPage = response.page
    stats = await getUserProjectStats()

    const createPageUrl = (pageNumber: number) => {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(searchParams)) {
        if (value === undefined) continue
        if (Array.isArray(value)) value.forEach((v) => params.append(key, v))
        else params.set(key, value)
      }
      params.set("page", pageNumber.toString())
      return `${params.toString()}`
    }

    return (
      <PageShell>
        <PageHeader>
          <div className="space-y-1">
            <PageHeaderHeading>Aprovação de Projetos</PageHeaderHeading>
            <PageHeaderDescription>Revise e aprove projetos submetidos pelos usuários.</PageHeaderDescription>
          </div>
        </PageHeader>
        <PageSecondaryHeader>
          <ProjectsApprovalToolbar />
        </PageSecondaryHeader>

        <PageContent>
          {/* Projects List */}
          {projects.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Projetos</h2>
                <span className="text-sm text-muted-foreground">{totalCount} projeto(s) encontrados</span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {projects.map((project: any) => (
                  <Link key={project.id} href={`/admin/projetos/${project.slug}/review`} className="group block h-full">
                    <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          {(() => {
                            const cfg = statusUi[project.status as ProjectStatus] ?? statusUi[ProjectStatus.PENDING_REVIEW]
                            const Icon = cfg.Icon
                            return (
                              <Badge variant="secondary" className={cfg.badgeClass}>
                                <Icon className="mr-1 h-3 w-3" />
                                {cfg.label}
                              </Badge>
                            )
                          })()}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{project.statusUpdatedAt || project.submittedAt ? formatDistanceToNow(new Date(project.statusUpdatedAt ?? project.submittedAt!), { addSuffix: true, locale: ptBR }) : "N/A"}</span>
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
                              <div className={`w-2 h-2 rounded-full ${project.legalInstrumentInstance ? "bg-green-500" : "bg-red-500"}`}></div>
                              <span className={project.legalInstrumentInstance ? "text-foreground" : "text-muted-foreground"}>Instrumento Jurídico</span>
                            </div>
                          </div>
                        </div>

                        {/* Instruments List */}
                        {project.legalInstrumentInstance && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Instrumentos</h4>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="truncate">{project.legalInstrumentInstance.legalInstrumentVersion.legalInstrument.name}</span>
                                <Badge variant="outline" className={project.legalInstrumentInstance.status === LegalInstrumentStatus.FILLED ? "bg-green-500/10 text-green-600 border-green-200" : project.legalInstrumentInstance.status === LegalInstrumentStatus.PARTIAL ? "bg-yellow-500/10 text-yellow-600 border-yellow-200" : "bg-muted text-muted-foreground"}>
                                  {project.legalInstrumentInstance.status === LegalInstrumentStatus.FILLED && "Preenchido"}
                                  {project.legalInstrumentInstance.status === LegalInstrumentStatus.PARTIAL && "Parcial"}
                                  {project.legalInstrumentInstance.status === LegalInstrumentStatus.PENDING && "Pendente"}
                                </Badge>
                              </div>
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

              {/* Pagination */}
              <div className="flex flex-col gap-2 border-t pt-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {pageCount} ({totalCount} projetos no total)
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild disabled={currentPage <= 1}>
                    {currentPage > 1 ? <Link href={`?${createPageUrl(currentPage - 1)}`}>Anterior</Link> : <span>Anterior</span>}
                  </Button>
                  <span className="text-sm font-medium px-2">
                    {currentPage} / {pageCount}
                  </span>
                  <Button variant="outline" size="sm" asChild disabled={currentPage >= pageCount}>
                    {currentPage < pageCount ? <Link href={`?${createPageUrl(currentPage + 1)}`}>Próxima</Link> : <span>Próxima</span>}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{stats?.totalGlobal === 0 ? "Ainda não há projetos por aqui" : hasActiveFilters ? "Nenhum resultado para os filtros selecionados" : "Nenhum projeto aguardando aprovação"}</h3>
              <p className="text-muted-foreground text-sm max-w-sm">{stats?.totalGlobal === 0 ? "Quando um projeto for submetido, ele vai aparecer aqui para revisão." : hasActiveFilters ? "Tente ajustar ou limpar os filtros para ver mais resultados." : "Você está em dia — não há projetos pendentes no momento."}</p>
            </div>
          )}
        </PageContent>
      </PageShell>
    )
  } catch (err) {
    console.error(err)
    return notFound()
  }
}

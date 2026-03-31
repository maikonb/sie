import { getProjectsForApproval, getUserProjectStats } from "@/actions/projects"
import { notFound, redirect } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { PageContent, PageHeader, PageHeaderDescription, PageHeaderHeading, PagePagination, PageSecondaryHeader, PageShell } from "@/components/shell"
import { ProjectsApprovalToolbar } from "@/components/admin/projects/approval-toolbar"
import { getProjectsApprovalDefaultQueryParams } from "@/components/admin/projects/approval-toolbar/default"
import { ProjectCard } from "@/components/admin/projects/project-card"

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
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              {/* Pagination */}
              <PagePagination currentPage={currentPage} pageCount={pageCount} totalCount={totalCount} searchParams={searchParams} itemLabel="projeto" />
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

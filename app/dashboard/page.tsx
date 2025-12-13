import { NewProject } from "@/components/new-project"
import { PageContent, PageHeader, PageHeaderDescription, PageHeaderHeading, PageShell } from "@/components/shell"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default function Page() {
  return (
    <PageShell>
      <PageHeader>
        <div className="space-y-1">
          <PageHeaderHeading>Dashboard</PageHeaderHeading>
          <PageHeaderDescription>Visão geral dos seus projetos e atividades.</PageHeaderDescription>
        </div>
      </PageHeader>
      <PageContent>
        <div className="p-4 bg-muted/50 aspect-video rounded-xl">
          <NewProject />
        </div>
      </PageContent>
    </PageShell>
  )
}

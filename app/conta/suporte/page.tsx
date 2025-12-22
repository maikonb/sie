"use client"

import { PageShell, PageHeader, PageHeaderHeading, PageHeaderDescription, PageContent } from "@/components/shell"
import { UnderDevelopment } from "@/components/ui/under-development"
import { LifeBuoy } from "lucide-react"

export default function Page() {
  return (
    <PageShell>
      <PageHeader>
        <div className="space-y-1">
          <PageHeaderHeading>Suporte</PageHeaderHeading>
          <PageHeaderDescription>Área de suporte ao usuário.</PageHeaderDescription>
        </div>
      </PageHeader>

      <PageContent>
        <UnderDevelopment icon={LifeBuoy} description="Em breve você poderá abrir e acompanhar solicitações de suporte." />
      </PageContent>
    </PageShell>
  )
}

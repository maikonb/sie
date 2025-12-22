"use client"

import { PageShell, PageHeader, PageHeaderHeading, PageHeaderDescription, PageContent } from "@/components/shell"
import { UnderDevelopment } from "@/components/ui/under-development"
import { Bell } from "lucide-react"

export default function Page() {
  return (
    <PageShell>
      <PageHeader>
        <div className="space-y-1">
          <PageHeaderHeading>Notificações</PageHeaderHeading>
          <PageHeaderDescription>Central de notificações do usuário.</PageHeaderDescription>
        </div>
      </PageHeader>

      <PageContent>
        <UnderDevelopment
          icon={Bell}
          description="Estamos preparando esta área. Em breve você poderá visualizar e gerenciar suas notificações aqui."
        />
      </PageContent>
    </PageShell>
  )
}

"use client"

import { PageShell, PageHeader, PageHeaderHeading, PageHeaderDescription, PageContent } from "@/components/shell"
import { UnderDevelopment } from "@/components/ui/under-development"
import { Send } from "lucide-react"

export default function Page() {
  return (
    <PageShell>
      <PageHeader>
        <div className="space-y-1">
          <PageHeaderHeading>Feedback</PageHeaderHeading>
          <PageHeaderDescription>Envie opiniões e sugestões.</PageHeaderDescription>
        </div>
      </PageHeader>

      <PageContent>
        <UnderDevelopment icon={Send} description="Em breve você poderá enviar feedbacks para melhorar a aplicação." />
      </PageContent>
    </PageShell>
  )
}

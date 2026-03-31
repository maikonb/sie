import { PageShell, PageHeader, PageHeaderHeading, PageHeaderDescription, PageContent } from "@/components/shell"
import { NotificationList } from "@/components/notifications/notification-list"

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
        <NotificationList />
      </PageContent>
    </PageShell>
  )
}

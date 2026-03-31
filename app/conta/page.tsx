"use client"

import { useSession } from "next-auth/react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { notify } from "@/lib/notifications"
import { ProfileForm } from "@/components/forms/account/profile-form"
import { EmailForm } from "@/components/forms/account/email-form"
import { PageContent, PageHeader, PageHeaderDescription, PageHeaderHeading, PageShell } from "@/components/shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function Page({}) {
  const { data: session, status } = useSession()

  const user = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
    color: session?.user?.color || "",
    id: session?.user?.id || "",
  }

  if (status === 'loading') {
    return (
      <PageShell>
        <PageHeader>
          <div className="space-y-1">
            <PageHeaderHeading>Perfil</PageHeaderHeading>
            <PageHeaderDescription>Gerencie suas informações pessoais.</PageHeaderDescription>
          </div>
          <Skeleton className="w-52 h-3" />
        </PageHeader>
        <PageContent>
          {/* ProfileForm skeleton */}
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <div className="relative">
                  <Skeleton className="h-40 w-40 rounded-4xl" />
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 gap-4">
                  <Skeleton className="h-12 w-full rounded-md" />
                  <div className="flex gap-4">
                    <Skeleton className="h-12 flex-1 rounded-md" />
                    <Skeleton className="h-12 w-40 rounded-md" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Skeleton className="h-9 w-36 rounded-md mb-4 mt-13" />
            </div>
          </div>

          <Separator />

          {/* EmailForm skeleton */}
          <div className="space-y-4 mt-6">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="pt-4">
              <Skeleton className="h-10 w-56 rounded-md" />
            </div>
          </div>
        </PageContent>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader className="items-center justify-between">
        <div className="space-y-1">
          <PageHeaderHeading>Perfil</PageHeaderHeading>
          <PageHeaderDescription>Gerencie suas informações pessoais.</PageHeaderDescription>
        </div>
        <div className="flex items-center group gap-2 opacity-80">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(user.id)
                notify.success("ID copiado")
              } catch (err) {
                notify.error("Falha ao copiar ID")
              }
            }}
            className="p-1 opacity-0 group-hover:opacity-50 cursor-pointer transition-opacity"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground opacity-50 transition-all duration-300">
            ID: <span className="font-mono">{user.id}</span>
          </p>
        </div>
      </PageHeader>
      <PageContent>
        <ProfileForm user={user} />
        <Separator />
        <EmailForm currentEmail={user.email} />
      </PageContent>
    </PageShell>
  )
}

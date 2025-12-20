"use client"

import { useSession } from "next-auth/react"
import { Separator } from "@/components/ui/separator"
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
  }

  if (status === 'loading') {
    return (
      <PageShell>
        <PageHeader>
          <div className="space-y-1">
            <PageHeaderHeading>Perfil</PageHeaderHeading>
            <PageHeaderDescription>Gerencie suas informações pessoais.</PageHeaderDescription>
          </div>
        </PageHeader>
        <PageContent>
          {/* ProfileForm skeleton */}
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <div className="relative">
                  <Skeleton className="h-40 w-40 rounded-2xl" />
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
      <PageHeader>
        <div className="space-y-1">
          <PageHeaderHeading>Perfil</PageHeaderHeading>
          <PageHeaderDescription>Gerencie suas informações pessoais.</PageHeaderDescription>
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

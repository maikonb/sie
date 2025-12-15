"use client"

import { useSession } from "next-auth/react"
import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/forms/account/profile-form"
import { EmailForm } from "@/components/forms/account/email-form"
import { PageContent, PageHeader, PageHeaderDescription, PageHeaderHeading, PageShell } from "@/components/shell"

export default function Page({}) {
  const { data: session, status } = useSession()

  const user = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
    color: session?.user?.color || "",
  }

  if (status === "loading") {
    return <div>Carregando...</div>
  }

  return (
    <PageShell>
      <PageHeader>
        <div className="space-y-1">
          <PageHeaderHeading>Perfil</PageHeaderHeading>
          <PageHeaderDescription>Gerencie suas informações pessoais.</PageHeaderDescription>
        </div>
      </PageHeader>
      <Separator />
      <PageContent>
        <ProfileForm user={user} />
        <Separator />
        <EmailForm currentEmail={user.email} />
      </PageContent>
    </PageShell>
  )
}

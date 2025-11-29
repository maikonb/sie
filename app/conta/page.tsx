"use client"

import { useSession } from "next-auth/react"
import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/forms/account/profile-form"
import { EmailForm } from "@/components/forms/account/email-form"

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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Perfil</h3>
        <p className="text-sm text-muted-foreground">Gerencie suas informações pessoais.</p>
      </div>
      <Separator />
      <ProfileForm user={user} />
      <Separator />
      <EmailForm currentEmail={user.email} />
    </div>
  )
}

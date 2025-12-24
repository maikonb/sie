"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

type UserAvatarSizeProps = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
type UserAvatarSizePreview = string
  | {
      name?: string | null
      image?: string | null
      color?: string | null
    }
  | null
  
interface UserAvatarProps {
  size?: UserAvatarSizeProps
  preview?: UserAvatarSizePreview
  className?: string
}

export function UserAvatar({ size = "sm", preview, className }: UserAvatarProps) {
  const isPreviewObject = typeof preview === "object" && preview !== null
  let user = null

  if (isPreviewObject) {
    user = preview
  } else {
    const { data: session } = useSession()
    user = session?.user
  }

  const sizeClasses: Record<UserAvatarSizeProps, string> = {
    sm: "h-8 w-8 text-xs rounded-lg",
    md: "h-12 w-12 text-sm rounded-lg",
    lg: "h-16 w-16 text-base rounded-xl",
    xl: "h-24 w-24 text-2xl rounded-2xl",
    "2xl": "h-32 w-32 text-3xl rounded-3xl",
    "3xl": "h-40 w-40 text-4xl rounded-4xl",
  }

  const imageUrl = typeof preview === "string" ? preview : user?.image
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={imageUrl || ""} alt={user?.name || "User"} className={cn(user?.color || "bg-muted")} />
      <AvatarFallback className={cn(sizeClasses[size], user?.color || "bg-muted", "text-white")}>
        {
          user?.name
          ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "?"
        }
      </AvatarFallback>
    </Avatar>
  )
}

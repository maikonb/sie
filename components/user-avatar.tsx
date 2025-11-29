"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  size?: "sm" | "md" | "lg" | "xl"
  preview?:
    | string
    | {
        name?: string | null
        image?: string | null
        color?: string | null
      }
    | null
  className?: string
}

export function UserAvatar({ size = "sm", preview, className }: UserAvatarProps) {

  const isPreviewObject = typeof preview === "object" && preview !== null
  let user = null;

  if (isPreviewObject) {
    user = preview
  } else {
    const { data: session } = useSession()
    user = session?.user
  }

  const sizeClasses = {
    sm: "h-8 w-8 text-xs rounded-lg",
    md: "h-12 w-12 text-sm rounded-lg",
    lg: "h-16 w-16 text-base rounded-xl",
    xl: "h-24 w-24 text-2xl rounded-2xl",
  }

  const userImageDefault = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "?"

  const imageUrl = typeof preview === "string" ? preview : user?.image

  const hasRoundedClass = className?.includes("rounded-")
  const fallbackRoundedClass = hasRoundedClass ? "" : "rounded-full"

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={imageUrl || ""} alt={user?.name || "User"} />
      <AvatarFallback className={cn(user?.color || "bg-muted", "text-white", fallbackRoundedClass, className?.match(/rounded-[a-z0-9-]+/)?.[0])}>{userImageDefault}</AvatarFallback>
    </Avatar>
  )
}

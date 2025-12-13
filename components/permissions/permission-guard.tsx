"use client"

import React from "react"
import useCan from "@/hooks/use-can"

type Props = {
  permission?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: Props) {
  if (!permission) return <>{children}</>

  const { can, loading } = useCan(permission)

  if (loading) return <>{fallback}</>
  if (!can) return <>{fallback}</>

  return <>{children}</>
}

export default PermissionGuard

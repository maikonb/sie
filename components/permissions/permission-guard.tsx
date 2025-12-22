"use client"

import React from "react"
import useCan from "@/hooks/use-can"

type Props = {
  permission?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  canMap?: Record<string, boolean>
}

export function PermissionGuard({ permission, children, fallback = null, canMap }: Props) {
  if (!permission) return <>{children}</>

  // Se canMap foi fornecido, usa diretamente (evita chamada redundante)
  if (canMap !== undefined) {
    const can = canMap[permission]
    if (!can) return <>{fallback}</>
    return <>{children}</>
  }

  // Fallback para comportamento legado
  const { can, loading } = useCan(permission)

  if (loading) return <>{fallback}</>
  if (!can) return <>{fallback}</>

  return <>{children}</>
}

export default PermissionGuard

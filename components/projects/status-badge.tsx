"use client"

import { ProjectStatus } from "@prisma/client"
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const projectStatusConfig = {
  [ProjectStatus.DRAFT]: {
    label: "Rascunho",
    badgeClass: "bg-muted text-muted-foreground border-border",
    Icon: Clock,
  },
  [ProjectStatus.PENDING_REVIEW]: {
    label: "Aguardando Análise",
    badgeClass: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
    Icon: AlertCircle,
  },
  [ProjectStatus.UNDER_REVIEW]: {
    label: "Em Análise",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
    Icon: Clock,
  },
  [ProjectStatus.APPROVED]: {
    label: "Aprovado",
    badgeClass: "bg-green-500/10 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900",
    Icon: CheckCircle2,
  },
  [ProjectStatus.REJECTED]: {
    label: "Rejeitado",
    badgeClass: "bg-red-500/10 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
    Icon: XCircle,
  },
  [(ProjectStatus as any).RETURNED || "RETURNED"]: {
    label: "Ajustes Solicitados",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900",
    Icon: AlertCircle,
  },
} as const

interface ProjectStatusBadgeProps {
  status: ProjectStatus | string
  className?: string
  showIcon?: boolean
}

export function ProjectStatusBadge({ status, className, showIcon = true }: ProjectStatusBadgeProps) {
  const cfg = projectStatusConfig[status as ProjectStatus] ?? projectStatusConfig[ProjectStatus.PENDING_REVIEW]
  const Icon = cfg.Icon

  return (
    <Badge variant="secondary" className={cn(cfg.badgeClass, className)}>
      {showIcon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
      {cfg.label}
    </Badge>
  )
}

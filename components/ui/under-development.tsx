"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Action = {
  label: string
  href?: string
}

interface UnderDevelopmentProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ComponentType<{ className?: string }>
  title?: string
  description?: string
  actions?: Action[]
}

export function UnderDevelopment({ icon: Icon, title = "Em desenvolvimento", description = "Estamos preparando esta área.", actions = [], className, ...props }: UnderDevelopmentProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/10 text-center space-y-3", className)} {...props}>
      {Icon ? <Icon className="h-6 w-6 text-muted-foreground" /> : null}
      <p className="text-sm text-muted-foreground">{title}</p>
      {description ? <p className="text-xs text-muted-foreground/80 max-w-prose">{description}</p> : null}
      {actions.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {actions.map((action, i) => (
            action.href ? (
              <Button key={i} variant="link" size="sm" asChild>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button key={i} variant="link" size="sm" disabled>
                {action.label}
              </Button>
            )
          ))}
        </div>
      ) : null}
    </div>
  )
}

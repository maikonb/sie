import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DependencyCardProps {
  title: string
  description: string
  icon: LucideIcon
  actionLabel: string
  actionLink: string
  variant?: "default" | "warning" | "success"
  className?: string
}

export function DependencyCard({ title, description, icon: Icon, actionLabel, actionLink, variant = "default", className }: DependencyCardProps) {
  const variantStyles = {
    default: "border-border bg-card",
    warning: "border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-900",
    success: "border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-900",
  }

  const iconStyles = {
    default: "text-primary",
    warning: "text-orange-600 dark:text-orange-400",
    success: "text-green-600 dark:text-green-400",
  }

  const buttonStyles = {
    default: "default",
    warning: "outline",
    success: "outline",
  } as const

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", variantStyles[variant], className)}>
      <CardContent className="p-6 flex items-start gap-4">
        <div className={cn("p-2 rounded-lg bg-background/50 backdrop-blur-sm shrink-0", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant={variant === "warning" ? "outline" : "default"} className={cn("shrink-0", variant === "warning" && "border-orange-200 hover:bg-orange-100 dark:border-orange-800 dark:hover:bg-orange-900/50")} asChild>
          <Link href={actionLink}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

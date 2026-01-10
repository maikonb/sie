"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react"
import { ProjectStatus, LegalInstrumentStatus } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"

const statusUi = {
  [ProjectStatus.DRAFT]: {
    label: "Rascunho",
    badgeClass: "bg-muted text-muted-foreground border-border",
    Icon: Clock,
  },
  [ProjectStatus.PENDING_REVIEW]: {
    label: "Pendente",
    badgeClass: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    Icon: Clock,
  },
  [ProjectStatus.UNDER_REVIEW]: {
    label: "Em Revisão",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-200",
    Icon: Clock,
  },
  [ProjectStatus.APPROVED]: {
    label: "Aprovado",
    badgeClass: "bg-green-500/10 text-green-600 border-green-200",
    Icon: CheckCircle2,
  },
  [ProjectStatus.REJECTED]: {
    label: "Rejeitado",
    badgeClass: "bg-red-500/10 text-red-600 border-red-200",
    Icon: XCircle,
  },
} as const

interface ProjectCardProps {
  project: any // Could be typed more strictly if needed
}

export function ProjectCard({ project }: ProjectCardProps) {
  const cfg = statusUi[project.status as ProjectStatus] ?? statusUi[ProjectStatus.PENDING_REVIEW]
  const Icon = cfg.Icon

  return (
    <Link href={`/admin/projetos/${project.slug}/review`} className="group block h-full">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 mb-3">
            <Badge variant="secondary" className={cfg.badgeClass}>
              <Icon className="mr-1 h-3 w-3" />
              {cfg.label}
            </Badge>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {project.statusUpdatedAt || project.submittedAt
                ? formatDistanceToNow(new Date(project.statusUpdatedAt ?? project.submittedAt!), {
                    addSuffix: true,
                    locale: ptBR,
                  })
                : "N/A"}
            </span>
          </div>
          <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">{project.title}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {/* Proposer Info */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <UserAvatar
              size="sm"
              preview={{
                name: project.user.name || "Sem nome",
                image: project.user.imageFile?.url,
                color: project.user.color,
              }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{project.user.name || "Usuário"}</p>
              <p className="text-xs text-muted-foreground truncate">{project.user.email}</p>
            </div>
          </div>

          {/* Dependencies Status */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Status das Dependências</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${project.workPlan ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className={project.workPlan ? "text-foreground" : "text-muted-foreground"}>Plano de Trabalho</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${project.legalInstrumentInstance ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className={project.legalInstrumentInstance ? "text-foreground" : "text-muted-foreground"}>Instrumento Jurídico</span>
              </div>
            </div>
          </div>

          {/* Instruments List */}
          {project.legalInstrumentInstance && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Instrumentos</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate">{project.legalInstrumentInstance.legalInstrumentVersion.legalInstrument.name}</span>
                  <Badge variant="outline" className={project.legalInstrumentInstance.status === LegalInstrumentStatus.FILLED ? "bg-green-500/10 text-green-600 border-green-200" : project.legalInstrumentInstance.status === LegalInstrumentStatus.PARTIAL ? "bg-yellow-500/10 text-yellow-600 border-yellow-200" : "bg-muted text-muted-foreground"}>
                    {project.legalInstrumentInstance.status === LegalInstrumentStatus.FILLED && "Preenchido"}
                    {project.legalInstrumentInstance.status === LegalInstrumentStatus.PARTIAL && "Parcial"}
                    {project.legalInstrumentInstance.status === LegalInstrumentStatus.PENDING && "Pendente"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="px-6 py-4 border-t bg-muted/20">
          <Button variant="ghost" className="w-full justify-between text-primary hover:bg-primary/10">
            Revisar Projeto
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </Link>
  )
}

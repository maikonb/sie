"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Loader2 } from "lucide-react"
import { approveProject } from "@/actions/projects"
import { notify } from "@/lib/notifications"

interface ApproveProjectDialogProps {
  slug: string
}

export function ApproveProjectDialog({ slug }: ApproveProjectDialogProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [approvalOpinion, setApprovalOpinion] = useState("")
  const [open, setOpen] = useState(false)

  const handleApprove = async () => {
    try {
      setIsApproving(true)
      await approveProject(slug, approvalOpinion)
      notify.success("Projeto aprovado com sucesso!")
      setOpen(false)
      router.push("/admin/projetos")
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      const message = error instanceof Error ? error.message : "Erro ao aprovar projeto"
      notify.error(message)
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={isApproving} size="default" className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprovar Projeto</DialogTitle>
          <DialogDescription>Forneça um parecer técnico ou observações sobre a aprovação deste projeto.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea placeholder="Escreva aqui o parecer técnico detalhado para a aprovação..." value={approvalOpinion} onChange={(e) => setApprovalOpinion(e.target.value)} className="min-h-[150px]" />
            <p className="text-[10px] text-muted-foreground italic">* Este parecer será enviado ao proponente e ficará registrado no histórico do projeto.</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove} disabled={isApproving || !approvalOpinion.trim()}>
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aprovando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmar Aprovação
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

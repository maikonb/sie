"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { XCircle, Loader2 } from "lucide-react"
import { rejectProject } from "@/actions/projects"
import { notify } from "@/lib/notifications"

interface RejectProjectDialogProps {
  slug: string
}

export function RejectProjectDialog({ slug }: RejectProjectDialogProps) {
  const router = useRouter()
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [open, setOpen] = useState(false)

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      notify.error("Motivo da rejeição é obrigatório")
      return
    }

    try {
      setIsRejecting(true)
      await rejectProject(slug, rejectReason)
      notify.success("Projeto rejeitado")
      setOpen(false)
      router.push("/admin/projetos")
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      const message = error instanceof Error ? error.message : "Erro ao rejeitar projeto"
      notify.error(message)
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
          <XCircle className="mr-2 h-4 w-4" /> Rejeitar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeitar Projeto</DialogTitle>
          <DialogDescription>Forneça um motivo claro para a rejeição do projeto.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea placeholder="Motivo da rejeição..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="min-h-[120px]" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isRejecting || !rejectReason.trim()}>
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejeitando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" /> Confirmar Rejeição
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2 } from "lucide-react"
import { requestProjectAdjustments } from "@/actions/projects"
import { notify } from "@/lib/notifications"

interface ReturnProjectDialogProps {
  slug: string
}

export function ReturnProjectDialog({ slug }: ReturnProjectDialogProps) {
  const router = useRouter()
  const [isReturning, setIsReturning] = useState(false)
  const [returnReason, setReturnReason] = useState("")
  const [open, setOpen] = useState(false)

  const handleRequestAdjustments = async () => {
    if (!returnReason.trim()) {
      notify.error("Motivo dos ajustes é obrigatório")
      return
    }

    try {
      setIsReturning(true)
      await requestProjectAdjustments(slug, returnReason)
      notify.success("Solicitação de ajustes enviada")
      setOpen(false)
      router.push("/admin/projetos")
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      const message = error instanceof Error ? error.message : "Erro ao solicitar ajustes"
      notify.error(message)
    } finally {
      setIsReturning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700">
          <AlertCircle className="mr-2 h-4 w-4" /> Ajustes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Ajustes</DialogTitle>
          <DialogDescription>Descreva quais alterações o proponente precisa realizar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea placeholder="Descreva os ajustes necessários..." value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="min-h-[120px]" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleRequestAdjustments} disabled={isReturning || !returnReason.trim()}>
              {isReturning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" /> Solicitar Ajustes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

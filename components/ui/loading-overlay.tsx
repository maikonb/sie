"use client"

import { Loader2 } from "lucide-react"

type LoadingOverlayProps = {
  open: boolean
  message?: string
}

export default function LoadingOverlay({ open, message = "Processando..." }: LoadingOverlayProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="rounded-md bg-card p-6 flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}

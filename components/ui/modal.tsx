"use client"

import { ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full"
  className?: string
  closable?: boolean
  hideHeader?: boolean
}

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  size = "md",
  className = "",
  hideHeader = false,
}: ModalProps) {
  const sizeClass =
    size === "xs"
      ? "sm:max-w-[320px]"
      : size === "sm"
      ? "sm:max-w-[400px]"
      : size === "md"
      ? "sm:max-w-[600px]"
      : size === "lg"
      ? "sm:max-w-[900px]"
      : size === "xl"
      ? "sm:max-w-[1100px]"
      : "max-w-none w-full"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClass} ${className}`.trim()}>
        {!hideHeader && title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}

        {children}

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

export default Modal

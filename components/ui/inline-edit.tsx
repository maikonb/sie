"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Edit2, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InlineEditProps {
  value: string
  onSave: (value: string) => Promise<void>
  label?: string
  multiline?: boolean
  className?: string
  inputClassName?: string
}

export function InlineEdit({ value: initialValue, onSave, label, multiline = false, className, inputClassName }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (value === initialValue) {
      setIsEditing(false)
      return
    }

    setLoading(true)
    try {
      await onSave(value)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setValue(initialValue)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel()
    } else if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  if (isEditing) {
    return (
      <div className={cn("space-y-2", className)}>
        {multiline ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn("min-h-[100px]", inputClassName)}
            disabled={loading}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={inputClassName}
            disabled={loading}
          />
        )}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Salvar
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} disabled={loading}>
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("group relative rounded-md border border-transparent hover:border-muted-foreground/20 p-2 -ml-2 transition-colors", className)}>
      <div className="whitespace-pre-wrap text-sm text-muted-foreground">{value || <span className="italic text-muted-foreground/50">Clique para adicionar {label?.toLowerCase()}...</span>}</div>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-1 top-1/2 transform-[translateY(-50%)] opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        onClick={() => setIsEditing(true)}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Editar {label}</span>
      </Button>
    </div>
  )
}

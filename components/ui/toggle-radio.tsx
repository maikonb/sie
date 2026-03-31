"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type ToggleRadioRowProps = Omit<React.ComponentProps<"button">, "type" | "onChange"> & {
  label: React.ReactNode
  checked: boolean
  onCheckedChange: (next: boolean) => void
}

function ToggleRadioRow({ label, checked, onCheckedChange, className, onClick, disabled, ...props }: ToggleRadioRowProps) {
  return (
    <button
      data-slot="toggle-radio-row"
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || disabled) return
        onCheckedChange(!checked)
      }}
      className={cn(
        "flex w-full items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-md transition-colors text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="h-4 w-4 rounded-full border border-input bg-background flex items-center justify-center">
        {checked ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
      </span>
      <span className="text-foreground select-none">{label}</span>
    </button>
  )
}

export { ToggleRadioRow }

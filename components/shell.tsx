"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageShell({ children, className, ...props }: PageShellProps) {
  return (
    <div className={cn("flex-1 space-y-8 p-8 pt-6", className)} {...props}>
      {children}
    </div>
  )
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageHeader({ children, className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "page-header md:sticky md:top-14 md:z-20 -mx-8 px-8 py-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex items-center justify-between space-y-2 transition-all",
        // When merged, we remove the background and blur on desktop to avoid "double blur"
        "in-[.is-merged]:md:bg-transparent in-[.is-merged]:md:backdrop-blur-none in-[.is-merged]:md:border-b-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface PageSecondaryHeaderPropos extends React.HTMLAttributes<HTMLDivElement> {}

export function PageSecondaryHeader({ children, className, ...props }: PageSecondaryHeaderPropos) {
  const [headerHeight, setHeaderHeight] = React.useState(0)
  const [isStuck, setIsStuck] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const header = document.querySelector(".page-header") as HTMLElement
    if (!header) return

    // Signal that we are merging to the PageHeader
    header.classList.add("is-merged")

    // Set initial height
    setHeaderHeight(header.getBoundingClientRect().height)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.target.getBoundingClientRect().height)
      }
    })

    resizeObserver.observe(header)

    // Sticky detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(entry.intersectionRatio < 1)
      },
      {
        threshold: [1],
        rootMargin: `-${56 + (window.innerWidth >= 768 ? headerHeight : 0) + 1}px 0px 0px 0px`,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      header.classList.remove("is-merged")
      resizeObserver.disconnect()
      observer.disconnect()
    }
  }, [headerHeight])

  React.useEffect(() => {
    const header = document.querySelector(".page-header") as HTMLElement
    if (!header) return

    if (isStuck) {
      header.style.borderBottomColor = "transparent"
    } else {
      header.style.borderBottomColor = ""
    }
  }, [isStuck])

  return (
    <div ref={ref} className={cn("sticky top-14 -mx-8 px-8 pt-3 md:pt-0 pb-3 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-colors md:top-[calc(3.5rem+var(--header-height,0px))] z-10", !isStuck ? "border-b-transparent" : "border-b-border", className)} style={{ "--header-height": `${headerHeight}px` } as React.CSSProperties} {...props}>
      {/* Background Shim: This "stretches" the blur upwards on desktop to cover the PageHeader area */}
      <div className="absolute inset-x-0 bottom-full hidden bg-inherit backdrop-blur-inherit supports-backdrop-filter:bg-inherit md:block" style={{ height: `${headerHeight}px` }} />

      {/* Content wrapper to stay above shim */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

interface PageHeaderHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function PageHeaderHeading({ children, className, ...props }: PageHeaderHeadingProps) {
  return (
    <h2 className={cn("text-3xl font-bold tracking-tight", className)} {...props}>
      {children}
    </h2>
  )
}

interface PageHeaderDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function PageHeaderDescription({ children, className, ...props }: PageHeaderDescriptionProps) {
  return (
    <p className={cn("text-muted-foreground", className)} {...props}>
      {children}
    </p>
  )
}

interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageContent({ children, className, ...props }: PageContentProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  )
}

interface PagePaginationProps {
  currentPage: number
  pageCount: number
  totalCount: number
  searchParams: Record<string, string | string[] | undefined>
  itemLabel?: string
  itemLabelPlural?: string
  pageParamName?: string
}

export function PagePagination({ currentPage, pageCount, totalCount, searchParams, itemLabel = "item", itemLabelPlural, pageParamName = "page" }: PagePaginationProps) {
  const labelPlural = itemLabelPlural || `${itemLabel}s`

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || key === pageParamName) continue
      if (Array.isArray(value)) value.forEach((v) => params.append(key, v))
      else params.set(key, value)
    }
    params.set(pageParamName, pageNumber.toString())
    return `?${params.toString()}`
  }

  if (pageCount <= 1) return null

  return (
    <div className="flex flex-col gap-2 border-t pt-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        Página {currentPage} de {pageCount} ({totalCount} {totalCount === 1 ? itemLabel : labelPlural} no total)
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="disabled:opacity-50 disabled:cursor-not-allowed" size="sm" asChild disabled={currentPage <= 1}>
          {currentPage > 1 ? <Link href={createPageUrl(currentPage - 1)}>Anterior</Link> : <span>Anterior</span>}
        </Button>
        <span className="text-sm font-medium px-2">
          {currentPage} / {pageCount}
        </span>
        <Button variant="outline" className="disabled:opacity-50 disabled:cursor-not-allowed" size="sm" asChild disabled={currentPage >= pageCount}>
          {currentPage < pageCount ? <Link href={createPageUrl(currentPage + 1)}>Próxima</Link> : <span>Próxima</span>}
        </Button>
      </div>
    </div>
  )
}
interface PageFiltersProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function PageFilters({ open, onOpenChange, trigger, title, description, children, footer }: PageFiltersProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col h-full p-0 md:w-[400px]">
        <SheetHeader className="p-6 border-b text-left">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">{children}</div>
        {footer && <SheetFooter className="mt-auto border-t p-6 bg-muted/20">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}

interface PageFilterGroupProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function PageFilterGroup({ label, children, className }: PageFilterGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-left block">{label}</Label>
      {children}
    </div>
  )
}

interface PageFilterRowProps {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

export function PageFilterRow({ label, checked, onCheckedChange, className }: PageFilterRowProps) {
  return (
    <label className={cn("flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-md transition-colors", className)}>
      <input type="checkbox" className="h-4 w-4 rounded border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} />
      <span className="text-foreground select-none">{label}</span>
    </label>
  )
}

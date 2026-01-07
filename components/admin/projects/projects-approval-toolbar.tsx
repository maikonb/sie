"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ArrowUpDown, CalendarDays, ChevronDown, ListFilter, Search, UserRound, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProjectStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

function CheckboxRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (next: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-md transition-colors">
      <input type="checkbox" className="h-4 w-4 rounded border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} />
      <span className="text-foreground select-none">{label}</span>
    </label>
  )
}

export function ProjectsApprovalToolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "")

  // Local state for filters in the Sheet (staging)
  const [localFilters, setLocalFilters] = useState({
    status: [] as ProjectStatus[],
    assignedToMe: false,
    hasWorkPlan: false,
    missingWorkPlan: false,
    hasLegalInstrument: false,
    missingLegalInstrument: false,
    dateStart: "",
    dateEnd: "",
  })

  // Sync local filters with URL when opening the sheet
  useEffect(() => {
    if (open) {
      setLocalFilters({
        status: searchParams.getAll("status") as ProjectStatus[],
        assignedToMe: searchParams.get("assignedToMe") === "true",
        hasWorkPlan: searchParams.get("hasWorkPlan") === "true",
        missingWorkPlan: searchParams.get("missingWorkPlan") === "true",
        hasLegalInstrument: searchParams.get("hasLegalInstrument") === "true",
        missingLegalInstrument: searchParams.get("missingLegalInstrument") === "true",
        dateStart: searchParams.get("dateStart") || "",
        dateEnd: searchParams.get("dateEnd") || "",
      })
    }
  }, [open, searchParams])

  // Helper to update search params
  const createQueryString = useCallback(
    (params: Record<string, string | string[] | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          newSearchParams.delete(key)
        } else if (Array.isArray(value)) {
          newSearchParams.delete(key)
          value.forEach((v) => newSearchParams.append(key, v))
        } else {
          newSearchParams.set(key, value)
        }
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  // Custom debounce for search (stays real-time as it's outside the sheet)
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || ""
      if (searchValue !== currentSearch) {
        router.push(`${pathname}?${createQueryString({ search: searchValue || null })}`, { scroll: false })
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchValue, pathname, router, createQueryString, searchParams])

  const handleApply = () => {
    const params: Record<string, string | string[] | null> = {
      status: localFilters.status,
      assignedToMe: localFilters.assignedToMe ? "true" : null,
      hasWorkPlan: localFilters.hasWorkPlan ? "true" : null,
      missingWorkPlan: localFilters.missingWorkPlan ? "true" : null,
      hasLegalInstrument: localFilters.hasLegalInstrument ? "true" : null,
      missingLegalInstrument: localFilters.missingLegalInstrument ? "true" : null,
      dateStart: localFilters.dateStart || null,
      dateEnd: localFilters.dateEnd || null,
    }

    router.push(`${pathname}?${createQueryString(params)}`, { scroll: false })
    setOpen(false)
  }

  const clearFilters = () => {
    setSearchValue("")
    router.push(pathname, { scroll: false })
    setOpen(false)
  }

  const toggleLocalStatus = (status: ProjectStatus, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: checked ? [...prev.status, status] : prev.status.filter((s) => s !== status),
    }))
  }

  const activeFiltersCount = searchParams.getAll("status").length + (searchParams.get("assignedToMe") === "true" ? 1 : 0) + (searchParams.get("hasWorkPlan") === "true" ? 1 : 0) + (searchParams.get("missingWorkPlan") === "true" ? 1 : 0) + (searchParams.get("hasLegalInstrument") === "true" ? 1 : 0) + (searchParams.get("missingLegalInstrument") === "true" ? 1 : 0) + (searchParams.get("dateStart") ? 1 : 0) + (searchParams.get("dateEnd") ? 1 : 0)

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por título, proponente..." className="pl-9 pr-9" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} aria-label="Buscar projetos" />
        {searchValue && (
          <button onClick={() => setSearchValue("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors group">
            <X className="h-4 w-4 group-hover:scale-110" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 gap-2", activeFiltersCount > 0 && "border-primary/50 bg-primary/5 text-primary")}>
              <ListFilter className="h-4 w-4 text-primary" />
              Filtros
              {activeFiltersCount > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{activeFiltersCount}</span>}
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="flex w-[320px] flex-col h-full p-0 sm:w-[400px]">
            <SheetHeader className="p-6 border-b text-left">
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Selecione os critérios e clique em aplicar.</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-left block">Status do Projeto</Label>
                <div className="grid grid-cols-2 gap-1">
                  <CheckboxRow label="Pendente" checked={localFilters.status.includes(ProjectStatus.PENDING_REVIEW)} onCheckedChange={(next) => toggleLocalStatus(ProjectStatus.PENDING_REVIEW, next)} />
                  <CheckboxRow label="Em revisão" checked={localFilters.status.includes(ProjectStatus.UNDER_REVIEW)} onCheckedChange={(next) => toggleLocalStatus(ProjectStatus.UNDER_REVIEW, next)} />
                  <CheckboxRow label="Aprovado" checked={localFilters.status.includes(ProjectStatus.APPROVED)} onCheckedChange={(next) => toggleLocalStatus(ProjectStatus.APPROVED, next)} />
                  <CheckboxRow label="Rejeitado" checked={localFilters.status.includes(ProjectStatus.REJECTED)} onCheckedChange={(next) => toggleLocalStatus(ProjectStatus.REJECTED, next)} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-left block">Atribuição</Label>
                <CheckboxRow label="Vinculados a mim" checked={localFilters.assignedToMe} onCheckedChange={(next) => setLocalFilters((prev) => ({ ...prev, assignedToMe: next }))} />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-left block">Período de Submissão</Label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground text-left block">Desde</Label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="date" className="h-9 pl-9 text-sm" value={localFilters.dateStart} onChange={(e) => setLocalFilters((prev) => ({ ...prev, dateStart: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground text-left block">Até</Label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="date" className="h-9 pl-9 text-sm" value={localFilters.dateEnd} onChange={(e) => setLocalFilters((prev) => ({ ...prev, dateEnd: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-left block">Pendências Técnicas</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground text-left block">Plano de Trabalho</Label>
                    <div className="grid grid-cols-1 gap-1">
                      <CheckboxRow label="Com plano" checked={localFilters.hasWorkPlan} onCheckedChange={(next) => setLocalFilters((prev) => ({ ...prev, hasWorkPlan: next, missingWorkPlan: next ? false : prev.missingWorkPlan }))} />
                      <CheckboxRow label="Sem plano" checked={localFilters.missingWorkPlan} onCheckedChange={(next) => setLocalFilters((prev) => ({ ...prev, missingWorkPlan: next, hasWorkPlan: next ? false : prev.hasWorkPlan }))} />
                    </div>
                  </div>
                  <Separator className="border-dashed" />
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground text-left block">Instrumento Jurídico</Label>
                    <div className="grid grid-cols-1 gap-1">
                      <CheckboxRow label="Com instrumento" checked={localFilters.hasLegalInstrument} onCheckedChange={(next) => setLocalFilters((prev) => ({ ...prev, hasLegalInstrument: next, missingLegalInstrument: next ? false : prev.missingLegalInstrument }))} />
                      <CheckboxRow label="Sem instrumento" checked={localFilters.missingLegalInstrument} onCheckedChange={(next) => setLocalFilters((prev) => ({ ...prev, missingLegalInstrument: next, hasLegalInstrument: next ? false : prev.hasLegalInstrument }))} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="mt-auto border-t p-6 bg-muted/20">
              <div className="flex w-full gap-3">
                <Button variant="outline" className="flex-1 h-10" onClick={clearFilters}>
                  Limpar Tudo
                </Button>
                <Button className="flex-1 h-10" onClick={handleApply}>
                  Aplicar Filtros
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              Ordenar
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Ordenação</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`${pathname}?${createQueryString({ sort: "date_desc" })}`)}>
              Data (mais recente)
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`${pathname}?${createQueryString({ sort: "date_asc" })}`)}>
              Data (mais antigo)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`${pathname}?${createQueryString({ sort: "title_asc" })}`)}>
              Título (A → Z)
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`${pathname}?${createQueryString({ sort: "title_desc" })}`)}>
              Título (Z → A)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

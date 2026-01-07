"use client"

import { useState } from "react"
import { ArrowUpDown, CalendarDays, ChevronDown, ListFilter, Search, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

function CheckboxRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <span className="text-foreground">{label}</span>
    </label>
  )
}

export function ProjectsApprovalToolbar() {
  const [open, setOpen] = useState(false)

  // Visual-only state: lets you preview multi-filter UX without implementing actual filtering.
  const [filters, setFilters] = useState({
    status: {
      pending: false,
      underReview: false,
      approved: false,
      rejected: false,
    },
    assignedToMe: false,
    hasWorkPlan: false,
    missingWorkPlan: false,
    hasLegalInstrument: false,
    missingLegalInstrument: false,
    dateStart: "",
    dateEnd: "",
  })

  const selectedCount =
    Number(filters.status.pending) +
    Number(filters.status.underReview) +
    Number(filters.status.approved) +
    Number(filters.status.rejected) +
    Number(filters.assignedToMe) +
    Number(filters.hasWorkPlan) +
    Number(filters.missingWorkPlan) +
    Number(filters.hasLegalInstrument) +
    Number(filters.missingLegalInstrument) +
    Number(!!filters.dateStart) +
    Number(!!filters.dateEnd)

  return (
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por título, proponente..." className="pl-9" aria-label="Buscar projetos" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="justify-between">
              <ListFilter className="h-4 w-4" />
              Filtros{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="p-0">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Combine múltiplos filtros para refinar a lista.</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-auto px-4 pb-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="space-y-2">
                    <CheckboxRow
                      label="Pendente"
                      checked={filters.status.pending}
                      onCheckedChange={(next) => setFilters((s) => ({ ...s, status: { ...s.status, pending: next } }))}
                    />
                    <CheckboxRow
                      label="Em revisão"
                      checked={filters.status.underReview}
                      onCheckedChange={(next) => setFilters((s) => ({ ...s, status: { ...s.status, underReview: next } }))}
                    />
                    <CheckboxRow
                      label="Aprovado"
                      checked={filters.status.approved}
                      onCheckedChange={(next) => setFilters((s) => ({ ...s, status: { ...s.status, approved: next } }))}
                    />
                    <CheckboxRow
                      label="Rejeitado"
                      checked={filters.status.rejected}
                      onCheckedChange={(next) => setFilters((s) => ({ ...s, status: { ...s.status, rejected: next } }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Usuário</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Buscar usuário (visual)" />
                  </div>
                  <p className="text-xs text-muted-foreground">(Por enquanto é visual; depois vira seleção real de usuário.)</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Vínculo</Label>
                  <CheckboxRow
                    label="Vinculados a mim"
                    checked={filters.assignedToMe}
                    onCheckedChange={(next) => setFilters((s) => ({ ...s, assignedToMe: next }))}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Período</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">De</Label>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="date"
                          className="pl-9"
                          value={filters.dateStart}
                          onChange={(e) => setFilters((s) => ({ ...s, dateStart: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Até</Label>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="date"
                          className="pl-9"
                          value={filters.dateEnd}
                          onChange={(e) => setFilters((s) => ({ ...s, dateEnd: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Pendências</Label>
                  <div className="space-y-2">
                    <CheckboxRow
                      label="Com plano de trabalho"
                      checked={filters.hasWorkPlan}
                      onCheckedChange={(next) => setFilters((s) => ({ ...s, hasWorkPlan: next }))}
                    />
                    <CheckboxRow
                      label="Sem plano de trabalho"
                      checked={filters.missingWorkPlan}
                      onCheckedChange={(next) => setFilters((s) => ({ ...s, missingWorkPlan: next }))}
                    />
                    <CheckboxRow
                      label="Com instrumento jurídico"
                      checked={filters.hasLegalInstrument}
                      onCheckedChange={(next) => setFilters((s) => ({ ...s, hasLegalInstrument: next }))}
                    />
                    <CheckboxRow
                      label="Sem instrumento jurídico"
                      checked={filters.missingLegalInstrument}
                      onCheckedChange={(next) => setFilters((s) => ({ ...s, missingLegalInstrument: next }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    setFilters({
                      status: { pending: false, underReview: false, approved: false, rejected: false },
                      assignedToMe: false,
                      hasWorkPlan: false,
                      missingWorkPlan: false,
                      hasLegalInstrument: false,
                      missingLegalInstrument: false,
                      dateStart: "",
                      dateEnd: "",
                    })
                  }
                >
                  Limpar
                </Button>
                <Button className="flex-1" onClick={() => setOpen(false)}>
                  Aplicar
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="justify-between">
              <ArrowUpDown className="h-4 w-4" />
              Ordenar
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ordenação</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Data (mais recente)</DropdownMenuItem>
            <DropdownMenuItem disabled>Data (mais antigo)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Status (A → Z)</DropdownMenuItem>
            <DropdownMenuItem disabled>Status (Z → A)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

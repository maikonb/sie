"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Trash2, Save, FileText, Upload, AlertCircle, HelpCircle, GripVertical } from "lucide-react"
import { notify } from "@/lib/notifications"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { updateLegalInstrument } from "@/actions/legal-instruments"
import { generatePresignedUrl } from "@/actions/storage"
import type { GetLegalInstrumentByIdResponse } from "@/actions/legal-instruments/types"

import type { LegalInstrumentFieldSpec } from "@/types/legal-instrument"

type FieldSpec = LegalInstrumentFieldSpec

interface EditLegalInstrumentClientProps {
  instrument: NonNullable<GetLegalInstrumentByIdResponse>
}

const FIELD_TYPES = [
  { value: "text", label: "Texto Curto" },
  { value: "textarea", label: "Texto Longo" },
  { value: "number", label: "Número" },
  { value: "date", label: "Data" },
  { value: "email", label: "E-mail" },
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "currency", label: "Moeda (R$)" },
]

function SortableRow({ field, index, updateField, removeField }: { field: FieldSpec; index: number; updateField: (idx: number, patch: Partial<FieldSpec>) => void; removeField: (idx: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: isDragging ? "relative" : "static",
  } as React.CSSProperties

  return (
    <div ref={setNodeRef} style={style} className={`grid grid-cols-[30px_1fr_1fr_1fr_80px_50px] gap-4 items-center px-6 py-3 hover:bg-muted/30 transition-colors group ${isDragging ? "bg-muted/50 shadow-md ring-1 ring-primary/20" : ""}`}>
      <div {...attributes} {...listeners} className="flex items-center justify-center cursor-move text-muted-foreground/50 hover:text-foreground outline-none">
        <GripVertical className="h-4 w-4" />
      </div>

      <div>
        <Input value={field.name} onChange={(e) => updateField(index, { name: e.target.value })} placeholder="ex: nome_contratante" className="h-9 font-mono text-xs bg-transparent border-transparent hover:border-input focus:border-input focus:bg-background transition-all" />
      </div>

      <div>
        <Input value={field.label} onChange={(e) => updateField(index, { label: e.target.value })} placeholder="ex: Nome do Contratante" className="h-9 bg-transparent border-transparent hover:border-input focus:border-input focus:bg-background transition-all" />
      </div>

      <div>
        <select className="flex h-9 w-full items-center justify-between rounded-md border border-transparent bg-transparent px-3 py-1 text-sm shadow-none ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background focus:border-input hover:border-input disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer" value={field.type} onChange={(e) => updateField(index, { type: e.target.value as FieldSpec["type"] })}>
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors cursor-pointer" onClick={() => updateField(index, { required: !field.required })}>
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" checked={field.required || false} onChange={(e) => updateField(index, { required: e.target.checked })} onClick={(e) => e.stopPropagation()} />
        </div>
      </div>

      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => removeField(index)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remover campo</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default function EditLegalInstrumentClient({ instrument }: EditLegalInstrumentClientProps) {
  const [fields, setFields] = useState<FieldSpec[]>([])
  const [uploading, setUploading] = useState(false)
  const [fileKey, setFileKey] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    // Initialize fields with IDs if they don't have them
    const initialFields = ((instrument.fieldsJson as unknown) as FieldSpec[]) || []
    const fieldsWithIds = initialFields.map((f) => ({
      ...f,
      id: f.id || `field_${Math.random().toString(36).substr(2, 9)}`,
    }))
    setFields(fieldsWithIds)
  }, [instrument.fieldsJson])

  function addField() {
    setFields([
      ...fields,
      {
        id: `field_${Date.now()}`,
        name: `field_${Date.now()}`,
        label: "",
        type: "text",
        required: true,
      },
    ])
  }

  function removeField(idx: number) {
    const copy = [...fields]
    copy.splice(idx, 1)
    setFields(copy)
  }

  function updateField(idx: number, patch: Partial<FieldSpec>) {
    const copy = [...fields]
    copy[idx] = { ...copy[idx], ...patch }
    setFields(copy)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  async function onUploadFile(file: File | null) {
    if (!file) return
    setUploading(true)
    try {
      const pres = await generatePresignedUrl(file.name, file.type, "legal-instruments")
      await fetch(pres.url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
      setFileKey(pres.key)
      notify.success("Arquivo enviado com sucesso", "Salve as alterações para vincular o novo arquivo ao instrumento.")
    } catch (err) {
      console.error(err)
      notify.error("Falha ao enviar arquivo")
    } finally {
      setUploading(false)
    }
  }

  async function onSave() {
    try {
      const payload: { fieldsJson: FieldSpec[]; fileKey?: string } = { fieldsJson: fields }
      if (fileKey) payload.fileKey = fileKey
      await updateLegalInstrument(instrument.id, payload)
      notify.success("Alterações salvas com sucesso")
    } catch (err) {
      console.error(err)
      notify.error("Erro ao salvar alterações")
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 w-6xl max-w-6xl mx-auto p-6">
        <div className="sticky top-14 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-4 border-b -mx-6 px-6 flex items-center justify-between transition-all">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground/90">Editor de Instrumento</h2>
            <p className="text-muted-foreground text-sm">Configure o template e defina os campos variáveis.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={uploading} size="sm" className="h-9 shadow-sm">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="fields" className="space-y-6">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-2">
            <TabsTrigger value="fields" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all cursor-pointer hover:bg-muted/60">
              Campos do Formulário
            </TabsTrigger>
            <TabsTrigger value="file" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all cursor-pointer hover:bg-muted/60">
              Arquivo de Template
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-0">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  Arquivo de Template
                </CardTitle>
                <CardDescription>
                  Faça upload do arquivo .docx ou .txt que servirá de base. Use <code>{"{{nome_variavel}}"}</code> para marcar os campos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Template Atual</Label>
                  <div className="flex items-center gap-3 p-4 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{instrument.templateFileId ? `Arquivo ID: ${instrument.templateFileId}` : "Nenhum arquivo vinculado"}</p>
                      <p className="text-xs text-muted-foreground">{instrument.updatedAt ? `Atualizado em ${new Date(instrument.updatedAt).toLocaleDateString()}` : "Sem data"}</p>
                    </div>
                    {instrument.templateFileId && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Upload Novo Template</Label>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Input type="file" accept=".pdf,.docx,.txt,.json" onChange={(e) => onUploadFile(e.target.files?.[0] ?? null)} disabled={uploading} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 h-12 pt-2" />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Formatos aceitos: PDF, DOCX, TXT, JSON. Tamanho máximo: 10MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fields" className="mt-0">
            <Card className="h-fit border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Campos do Formulário</CardTitle>
                  <CardDescription>Defina os campos que o usuário deverá preencher.</CardDescription>
                </div>
                <Button onClick={addField} size="sm" className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Campo
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="min-w-[800px]">
                  {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">Nenhum campo definido</h3>
                      <p className="text-muted-foreground text-sm max-w-sm mb-4">Comece adicionando campos que correspondem às variáveis no seu template.</p>
                      <Button onClick={addField} variant="outline">
                        Adicionar Primeiro Campo
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      <div className="grid grid-cols-[30px_1fr_1fr_1fr_80px_50px] gap-4 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div></div>
                        <div>Identificador (Name)</div>
                        <div>Rótulo (Label)</div>
                        <div>Tipo</div>
                        <div className="text-center">Obrigatório</div>
                        <div></div>
                      </div>

                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                          <div className="divide-y">
                            {fields.map((f, i) => (
                              <SortableRow key={f.id} field={f} index={i} updateField={updateField} removeField={removeField} />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

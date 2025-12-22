"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LegalInstrumentInstance } from "@prisma/client"
import { Save, Loader2, ArrowLeft, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import { saveLegalInstrumentAnswers, sendForAnalysis } from "@/actions/legal-instruments"

type FieldSpec = {
  id: string
  name: string
  label: string
  type: string
  required?: boolean
  options?: string[]
}

interface LegalInstrumentFillClientProps {
  instance: LegalInstrumentInstance & {
    file?: {
      url: string
      key: string
    } | null
    status: string // Add status explicitly if not in LegalInstrumentInstance yet
  }
  projectSlug: string
}

export default function LegalInstrumentFillClient({ instance, projectSlug }: LegalInstrumentFillClientProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<any>(instance.answers || {})
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  const fields = (instance.fieldsJson as unknown as FieldSpec[]) || []
  const isDraft = instance.status === "DRAFT"

  const handleChange = (id: string, value: any) => {
    if (!isDraft) return
    setAnswers((prev: any) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    // Basic validation
    for (const field of fields) {
      if (field.required && !answers[field.id]) {
        toast.error(`O campo "${field.label}" é obrigatório.`)
        return
      }
    }

    setSaving(true)
    try {
      await saveLegalInstrumentAnswers(instance.id, answers)
      toast.success("Dados salvos com sucesso!")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar dados.")
    } finally {
      setSaving(false)
    }
  }

  const handleSendForAnalysis = async () => {
    // Basic validation
    for (const field of fields) {
      if (field.required && !answers[field.id]) {
        toast.error(`O campo "${field.label}" é obrigatório.`)
        return
      }
    }

    setSending(true)
    try {
      // Ensure saved first
      await saveLegalInstrumentAnswers(instance.id, answers)

      await sendForAnalysis(instance.id)
      toast.success("Enviado para análise com sucesso!")
      router.push(`/projetos/${projectSlug}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao enviar para análise.")
    } finally {
      setSending(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary">Rascunho</Badge>
      case "SENT_FOR_ANALYSIS":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Em Análise</Badge>
      case "APPROVED":
        return <Badge className="bg-green-500 hover:bg-green-600">Aprovado</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejeitado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Preenchimento do Instrumento Jurídico</h1>
            {getStatusBadge(instance.status)}
          </div>
          <p className="text-muted-foreground">Preencha os campos abaixo para gerar o documento.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Instrumento</CardTitle>
          <CardDescription>Campos definidos para este tipo de instrumento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhum campo configurado para este instrumento.</div>}

          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {field.type === "textarea" ? (
                <Textarea id={field.id} value={answers[field.id] || ""} onChange={(e) => handleChange(field.id, e.target.value)} placeholder={`Digite ${field.label.toLowerCase()}...`} className="min-h-[100px]" disabled={!isDraft} />
              ) : field.type === "date" ? (
                <Input id={field.id} type="date" value={answers[field.id] || ""} onChange={(e) => handleChange(field.id, e.target.value)} disabled={!isDraft} />
              ) : field.type === "number" || field.type === "currency" ? (
                <Input id={field.id} type="number" step={field.type === "currency" ? "0.01" : "1"} value={answers[field.id] || ""} onChange={(e) => handleChange(field.id, e.target.value)} placeholder={field.type === "currency" ? "0,00" : ""} disabled={!isDraft} />
              ) : (
                <Input id={field.id} type={field.type === "email" ? "email" : "text"} value={answers[field.id] || ""} onChange={(e) => handleChange(field.id, e.target.value)} placeholder={`Digite ${field.label.toLowerCase()}...`} disabled={!isDraft} />
              )}
            </div>
          ))}

          <Separator className="my-6" />

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Voltar
            </Button>
            {isDraft && (
              <>
                <Button onClick={handleSave} disabled={saving || sending} variant="secondary">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Rascunho
                    </>
                  )}
                </Button>
                <Button onClick={handleSendForAnalysis} disabled={saving || sending}>
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar para Análise
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

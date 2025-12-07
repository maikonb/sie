"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateLegalInstrument, previewLegalInstrument } from "@/actions/legal-instruments"
import { generatePresignedUrl } from "@/actions/storage"

type FieldSpec = {
  name: string
  label: string
  type: string
  required?: boolean
  options?: string[]
}

export default function EditLegalInstrumentClient({ instrument }: any) {
  const [fields, setFields] = useState<FieldSpec[]>(instrument.fieldsJson || [])
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fileKey, setFileKey] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function addField() {
    setFields([...fields, { name: `field_${Date.now()}`, label: "Novo Campo", type: "text", required: false }])
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

  async function onUploadFile(file: File | null) {
    if (!file) return
    setUploading(true)
    try {
      const pres = await generatePresignedUrl(file.name, file.type, "legal-instruments")
      await fetch(pres.url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
      setFileKey(pres.key)
      setMessage("Arquivo enviado. Salve para vincular ao instrumento.")
    } catch (err: any) {
      setMessage("Falha ao enviar arquivo")
    } finally {
      setUploading(false)
    }
  }

  async function onSave() {
    setMessage(null)
    try {
      const payload: any = { fieldsJson: fields }
      if (fileKey) payload.fileKey = fileKey
      const res = await updateLegalInstrument(instrument.id, payload)
      // Actions typically throw on error or return data. Assuming success if no throw.
      setMessage("Alterações salvas")
    } catch (err: any) {
      setMessage("Erro ao salvar")
    }
  }

  async function onPreview(sampleValues?: Record<string, string>) {
    setMessage(null)
    try {
      const res = await previewLegalInstrument(instrument.id, fields, sampleValues)
      setPreview(res.preview)
    } catch (err: any) {
      setMessage("Erro ao gerar preview")
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Editar Instrumento Jurídico</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Template atual</label>
        <div className="text-sm text-muted-foreground">{instrument.fileId ? `File ID: ${instrument.fileId}` : "Nenhum arquivo"}</div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Upload novo template (texto)</label>
        <Input type="file" accept="text/plain,application/json,application/octet-stream" onChange={(e) => onUploadFile(e.target.files?.[0] ?? null)} />
      </div>

      <div className="mb-4">
        <h3 className="font-medium">Campos do formulário</h3>
        {fields.map((f, i) => (
          <div key={i} className="p-2 border rounded mb-2">
            <div className="flex gap-2">
              <Input value={f.name} onChange={(e) => updateField(i, { name: e.target.value })} />
              <Input value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} />
              <Input value={f.type} onChange={(e) => updateField(i, { type: e.target.value })} />
              <Button onClick={() => removeField(i)} variant="ghost">
                Remover
              </Button>
            </div>
          </div>
        ))}
        <Button onClick={addField}>Adicionar campo</Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onPreview({})} disabled={uploading}>
          Gerar preview
        </Button>
        <Button onClick={onSave} disabled={uploading}>
          Salvar
        </Button>
      </div>

      {message && <div className="mt-4 text-sm">{message}</div>}

      {preview && (
        <div className="mt-6">
          <h4 className="font-medium">Preview</h4>
          <Textarea value={preview} readOnly rows={12} />
        </div>
      )}
    </div>
  )
}

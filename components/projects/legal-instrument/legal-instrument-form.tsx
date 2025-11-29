"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface LegalInstrumentFormProps {
  classification: string
  sieData: any
}

export function LegalInstrumentForm({ classification, sieData }: LegalInstrumentFormProps) {
  // Mock fields based on classification
  const getFields = (type: string) => {
    switch (type) {
      case "PDI_AGREEMENT":
        return (
          <>
            <div className="grid gap-2">
              <Label>Plano de Trabalho (Detalhado)</Label>
              <Textarea placeholder="Cole o plano de trabalho detalhado..." />
            </div>
            <div className="grid gap-2">
              <Label>Orçamento Previsto</Label>
              <Input type="number" placeholder="R$ 0,00" />
            </div>
          </>
        )
      case "SERVICE_CONTRACT":
        return (
          <>
            <div className="grid gap-2">
              <Label>Escopo do Serviço</Label>
              <Textarea placeholder="Descreva o serviço..." />
            </div>
            <div className="grid gap-2">
              <Label>Valor do Contrato</Label>
              <Input type="number" placeholder="R$ 0,00" />
            </div>
          </>
        )
      default:
        return (
          <div className="grid gap-2">
            <Label>Observações Gerais</Label>
            <Textarea placeholder="Observações..." />
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instrumento Jurídico: {classification.replace(/_/g, " ")}</CardTitle>
        <CardDescription>
          Protocolo SIE: <strong>{sieData?.sieId}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-md text-sm">
          <p>Este formulário é específico para o tipo de instrumento selecionado.</p>
        </div>
        <form className="space-y-4">
          {getFields(classification)}
          <Button type="submit">Salvar Instrumento</Button>
        </form>
      </CardContent>
    </Card>
  )
}

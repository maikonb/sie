"use client"

import { useState } from "react"
import Link from "next/link"
import { ProjectClassificationWizard } from "@/components/projects/project-classification-wizard"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ProjectFormProps {
  createAction: (formData: FormData) => Promise<void>
}

export function ProjectForm({ createAction }: ProjectFormProps) {
  const [partnershipType, setPartnershipType] = useState<string>("")

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Novo Projeto</CardTitle>
          <CardDescription>Preencha os dados do seu projeto (Plano de Trabalho ficará para depois).</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="space-y-6">
            <input type="hidden" name="partnershipType" value={partnershipType} />

            <div className="grid gap-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" name="titulo" placeholder="Ex.: Plataforma de Inovação SIE/UFR" required maxLength={200} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="objetivos">Objetivos</Label>
              <Textarea id="objetivos" name="objetivos" placeholder="Descreva os objetivos do projeto..." required rows={6} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="justificativa">Justificativa</Label>
              <Textarea id="justificativa" name="justificativa" placeholder="Explique a relevância pública/acadêmica, demanda atendida, etc." required rows={6} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="abrangencia">Abrangência</Label>
              <Textarea id="abrangencia" name="abrangencia" placeholder="Defina localidades, público-alvo e alcance..." required rows={5} />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/projetos/">Cancelar</Link>
              </Button>
              <Button type="submit">Salvar projeto</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ProjectFormProps {
  createAction: (formData: FormData) => Promise<{ success: boolean; slug?: string; error?: string }>
}

export function ProjectForm({ createAction }: ProjectFormProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdSlug, setCreatedSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await createAction(formData)
      if (result.success && result.slug) {
        setCreatedSlug(result.slug)
        setIsSuccess(true)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess && createdSlug) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-green-700">Projeto Criado com Sucesso!</CardTitle>
            <CardDescription>O projeto foi salvo. Escolha o próximo passo:</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Button asChild variant="secondary" className="justify-start h-auto py-3 px-4">
                <Link href={`/projetos/${createdSlug}/work-plan?returnTo=/projetos/${createdSlug}`}>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-semibold">Preencher Plano de Trabalho</span>
                    <span className="text-xs text-muted-foreground">Definir objetivos, metodologia e cronograma.</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start h-auto py-3 px-4">
                <Link href={`/projetos/${createdSlug}/legal?returnTo=/projetos/${createdSlug}`}>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-semibold">Definir Instrumento Jurídico</span>
                    <span className="text-xs text-muted-foreground">Classificar a parceria e gerar documentos.</span>
                  </div>
                </Link>
              </Button>
            </div>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-green-500/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou</span>
              </div>
            </div>
            <Button variant="outline" asChild size="lg" className="w-full">
              <Link href={`/projetos/${createdSlug}`}>Ir para o Projeto (Visualizar)</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Novo Projeto</CardTitle>
          <CardDescription>Preencha os dados do seu projeto (Plano de Trabalho ficará para depois).</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
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
              <Button variant="outline" asChild disabled={isLoading}>
                <Link href="/projetos/">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar projeto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

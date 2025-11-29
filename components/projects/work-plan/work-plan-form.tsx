"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { upsertWorkPlan } from "@/app/actions/work-plan"
import { notify } from "@/lib/notifications"

const workPlanSchema = z.object({
  object: z.string().optional(),
  diagnosis: z.string().optional(),
  planScope: z.string().optional(),
  planJustification: z.string().optional(),
  generalObjective: z.string().min(1, "Objetivo Geral é obrigatório"),
  methodology: z.string().optional(),
  expectedResults: z.string().optional(),
})

type WorkPlanValues = z.infer<typeof workPlanSchema>

export function WorkPlanForm({ project, initialData, returnTo }: { project: any; initialData?: any; returnTo?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<WorkPlanValues>({
    resolver: zodResolver(workPlanSchema),
    defaultValues: initialData || {
      object: "",
      diagnosis: "",
      planScope: "",
      planJustification: "",
      generalObjective: "",
      methodology: "",
      expectedResults: "",
    },
  })

  async function onSubmit(data: WorkPlanValues) {
    setIsLoading(true)
    try {
      await upsertWorkPlan(project.id, data)
      notify.success("Plano de Trabalho salvo com sucesso!")
      if (returnTo) {
        router.push(returnTo)
      }
    } catch (error) {
      console.error(error)
      notify.error("Erro ao salvar Plano de Trabalho")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="objectives">Objetivos</TabsTrigger>
          <TabsTrigger value="methodology">Metodologia</TabsTrigger>
          <TabsTrigger value="team" disabled>
            Equipe (Em breve)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
              <CardDescription>Defina o escopo e justificativa do plano.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="object">Objeto</Label>
                <Textarea id="object" {...form.register("object")} placeholder="Descrição sucinta do objeto..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="diagnosis">Diagnóstico do Problema</Label>
                <Textarea id="diagnosis" {...form.register("diagnosis")} placeholder="Situação atual..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="planJustification">Justificativa da Proposição</Label>
                <Textarea id="planJustification" {...form.register("planJustification")} placeholder="Por que este plano é necessário?" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="objectives" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Objetivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="generalObjective">Objetivo Geral</Label>
                <Textarea id="generalObjective" {...form.register("generalObjective")} placeholder="Objetivo principal..." />
                {form.formState.errors.generalObjective && <p className="text-sm text-destructive">{form.formState.errors.generalObjective.message}</p>}
              </div>
              {/* Specific Objectives will be a dynamic list later */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Metodologia e Resultados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="methodology">Metodologia de Execução</Label>
                <Textarea id="methodology" {...form.register("methodology")} placeholder="Como será executado..." rows={5} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expectedResults">Resultados Esperados</Label>
                <Textarea id="expectedResults" {...form.register("expectedResults")} placeholder="O que se espera alcançar..." rows={5} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Plano de Trabalho"}
        </Button>
      </div>
    </form>
  )
}

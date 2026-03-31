"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateProject } from "@/actions/projects"
import { notify } from "@/lib/notifications"
import { useRouter } from "next/navigation"

const projectSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  objectives: z.string().min(1, "Os objetivos são obrigatórios"),
  justification: z.string().min(1, "A justificativa é obrigatória"),
  scope: z.string().min(1, "A abrangência é obrigatória"),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectEditSheetProps {
  project: {
    slug: string
    title: string
    objectives: string
    justification: string
    scope: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectEditSheet({ project, open, onOpenChange }: ProjectEditSheetProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title,
      objectives: project.objectives,
      justification: project.justification,
      scope: project.scope,
    },
  })

  async function onSubmit(data: ProjectFormValues) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("titulo", data.title)
      formData.append("objetivos", data.objectives)
      formData.append("justificativa", data.justification)
      formData.append("abrangencia", data.scope)

      await updateProject(project.slug, formData)
      notify.success("Projeto atualizado com sucesso!")
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      notify.error("Erro ao atualizar projeto.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto px-10">
        <SheetHeader>
          <SheetTitle>Editar Detalhes do Projeto</SheetTitle>
          <SheetDescription>Faça alterações nas informações principais do projeto aqui. Clique em salvar quando terminar.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Projeto</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título do projeto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivos</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva os objetivos do projeto" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justificativa</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Justifique a realização do projeto" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abrangência</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Defina a abrangência do projeto" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

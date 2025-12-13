"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Project } from "@prisma/client"
import { updateProject } from "@/actions/projects"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface EditProjectFormProps {
  project: Project
}

export function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUpdateProject = async (formData: FormData) => {
    setLoading(true)
    try {
      await updateProject(project.slug!, formData)
      toast.success("Projeto atualizado com sucesso!")
      router.push(`/projetos/${project.slug}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar projeto.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar Projeto</CardTitle>
          <CardDescription>Atualize as informações do seu projeto.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdateProject} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" name="titulo" placeholder="Ex.: Plataforma de Inovação SIE/UFR" required maxLength={200} defaultValue={project.title} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="objetivos">Objetivos</Label>
              <Textarea id="objetivos" name="objetivos" placeholder="Descreva os objetivos do projeto..." required rows={6} defaultValue={project.objectives} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="justificativa">Justificativa</Label>
              <Textarea id="justificativa" name="justificativa" placeholder="Explique a relevância pública/acadêmica, demanda atendida, etc." required rows={6} defaultValue={project.justification} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="abrangencia">Abrangência</Label>
              <Textarea id="abrangencia" name="abrangencia" placeholder="Defina localidades, público-alvo e alcance..." required rows={5} defaultValue={project.scope} />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" asChild disabled={loading}>
                <Link href={`/projetos/${project.slug}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

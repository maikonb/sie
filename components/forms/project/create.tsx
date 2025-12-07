"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Project } from "@/prisma/client"
import { Check, FileText, Scale, Clock } from "lucide-react"
import { projectService } from "@/services/api/project"

interface ProjectFormProps {
  initialProject?: Project | null
}

export function ProjectForm({ initialProject }: ProjectFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<"create" | "choisen" | "loading">(initialProject ? "choisen" : "create")
  const [project, setProject] = useState<Project | null>(initialProject || null)

  const handleCreateProject = async (formData: FormData) => {
    setStep("loading")
    try {
      const p = await projectService.create(formData)

      setProject(p)
      setStep("choisen")
      router.replace(`/projetos/novo?slug=${p.slug}`)
    } catch (error) {
      console.error(error)
      setStep("create")
    }
  }

  if (step === "choisen") {
    return (
      <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit mb-4 ring-8 ring-green-50 dark:ring-green-900/10">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl font-bold">Projeto criado com sucesso!</CardTitle>
            <CardDescription className="text-lg mt-2">
              O projeto <span className="font-medium text-foreground">"{project?.title}"</span> foi iniciado.
              <br />
              Como você deseja prosseguir?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <Link href={`/projetos/${project?.slug}/work-plan?next=legal-instrument`} className="group">
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer border-muted">
                <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Inserir Plano de Negócio</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed px-2">Defina a estrutura, mercado e viabilidade do seu projeto.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/projetos/${project?.slug}/legal-instrument?next=work-plan`} className="group">
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer border-muted">
                <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Scale className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Inserir Instrumento Jurídico</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed px-2">Anexe contratos, termos e documentos legais necessários.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/projetos/${project?.slug}`} className="group">
              <Card className="h-full hover:border-muted-foreground/50 hover:shadow-md transition-all duration-300 cursor-pointer border-muted bg-muted/30">
                <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-muted text-muted-foreground group-hover:bg-muted-foreground group-hover:text-background transition-colors duration-300">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg group-hover:text-foreground transition-colors">Inserir dependências mais tarde</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed px-2">Finalizar por agora e retornar à listagem de projetos.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
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
          <form action={handleCreateProject} className="space-y-6">
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

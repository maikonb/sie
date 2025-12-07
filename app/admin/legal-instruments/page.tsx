import Link from "next/link"
import { getLegalInstruments } from "@/actions/legal-instruments"
import { notFound } from "next/navigation"
import { Plus, FileText, ChevronRight, Calendar, FileCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default async function Page() {
  let list = []
  try {
    list = await getLegalInstruments()
  } catch (err) {
    console.error(err)
    return notFound()
  }

  return (
    <div className="space-y-8 w-6xl max-w-6xl mx-auto p-7">
        <div className="sticky top-14 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-4 border-b -mx-6 px-6 flex items-center justify-between transition-all">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Instrumentos Jurídicos</h1>
            <p className="text-muted-foreground text-sm max-w-2xl">Gerencie os modelos de documentos e contratos utilizados no sistema.</p>
          </div>
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Instrumento
          </Button>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((li) => (
          <Link key={li.id} href={`/admin/legal-instruments/${li.id}`} className="group block h-full">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 group-hover:bg-muted/5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  {li.fileId ? (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200">
                      <FileCheck className="mr-1 h-3 w-3" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Rascunho
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">{li.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm mt-1.5 h-10">{li.description || "Sem descrição definida."}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-4 border-t">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{li.createdAt ? new Date(li.createdAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-primary font-medium">
                    Editar
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {list.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Nenhum instrumento encontrado</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">Comece criando o primeiro modelo de documento para o sistema.</p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Criar Instrumento
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

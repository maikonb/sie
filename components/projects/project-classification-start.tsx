"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Play, RotateCcw } from "lucide-react"

interface Props {
  onStart: () => void
  onResume: (savedState: any) => void
}

export function ProjectClassificationStart({ onStart, onResume }: Props) {
  const [savedState, setSavedState] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const urlState = searchParams.get("state")
    const saved = localStorage.getItem("legalInstrumentWizard")
    if (saved && !urlState) {
      try {
        const parsed = JSON.parse(saved)
        setSavedState(parsed)
      } catch (e) {
        console.error("Failed to parse saved state", e)
      }
    }
  }, [searchParams])

  const handleStart = () => {
    // ensure we start from scratch
    localStorage.removeItem("legalInstrumentWizard")
    const url = new URL(window.location.href)
    url.searchParams.delete("state")
    router.replace(url.pathname + url.search)
    onStart()
  }

  const handleResume = () => {
    if (!savedState) return
    onResume(savedState)
  }

  return (
    <div className="w-full max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
      <Card className="w-full border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-6">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Classificação do Projeto</CardTitle>
          <CardDescription className="text-lg mt-2">Vamos identificar o instrumento jurídico ideal para o seu projeto através de algumas perguntas simples.</CardDescription>
        </CardHeader>

        <CardContent className="text-center pb-8">
          <p className="text-muted-foreground">Este processo ajuda a garantir a conformidade e a escolher o modelo de contrato mais adequado.</p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center pb-8">
          {savedState ? (
            <>
              <Button variant="outline" size="lg" onClick={handleStart} className="w-full sm:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" />
                Começar do zero
              </Button>
              <Button size="lg" onClick={handleResume} className="w-full sm:w-auto">
                <Play className="mr-2 h-4 w-4" />
                Continuar de onde parou
              </Button>
            </>
          ) : (
            <Button size="lg" onClick={handleStart} className="w-full sm:w-auto min-w-[200px] text-lg h-12">
              Iniciar Classificação
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default ProjectClassificationStart

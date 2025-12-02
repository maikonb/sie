"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMachine } from "@xstate/react"
import { createProjectFlowMachine } from "@/lib/project-flow-machine"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, HelpCircle, RotateCcw, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const STATE_TO_PARTNERSHIP_TYPE: Record<string, string> = {
  result_pdi_agreement: "PDI_AGREEMENT",
  result_service_contract: "SERVICE_CONTRACT",
  result_appdi_private: "APPDI_PRIVATE",
  result_appdi_no_funding: "APPDI_NO_FUNDING",
  result_coop_agreement: "COOP_AGREEMENT",
  result_nda: "NDA",
  result_tech_transfer: "TECH_TRANSFER",
  result_review_scope: "REVIEW_SCOPE",
}

interface ProjectClassificationWizardProps {
  onComplete: (result: any) => void
  initialState?: any
  onReset?: () => void
}

export function ProjectClassificationWizard({ onComplete, initialState, onReset }: ProjectClassificationWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [resetKey, setResetKey] = useState(0)

  const machine = useMemo(() => createProjectFlowMachine(), [])
  const [state, send] = useMachine(machine)
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([])

  const currentStateValue = state.value as string
  const isFinal = Object.keys(STATE_TO_PARTNERSHIP_TYPE).includes(currentStateValue)
  const currentStateNode = machine.states[currentStateValue as keyof typeof machine.states] as any
  const description = currentStateNode?.meta?.description || "Responda para continuar..."

  const handleAnswer = (answer: "YES" | "NO") => {
    setHistory((prev) => [...prev, { question: description, answer: answer === "YES" ? "Sim" : "Não" }])
    send({ type: answer === "YES" ? "ANSWER_YES" : "ANSWER_NO" })
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
      return
    }

    localStorage.removeItem("legalInstrumentWizard")
    setHistory([])
    send({ type: "RESET" })
    setResetKey((k) => k + 1)

    const url = new URL(window.location.href)
    url.searchParams.delete("state")
    router.replace(url.pathname + url.search)
  }

  const handleConfirm = () => {
    const partnershipType = STATE_TO_PARTNERSHIP_TYPE[currentStateValue]
    if (partnershipType) {
      onComplete({ type: partnershipType, history })
      localStorage.removeItem("legalInstrumentWizard")
    }
  }

  useEffect(() => {
    if (initialState && initialState.history && initialState.history.length > 0) {
      send({ type: "RESET" })
      initialState.history.forEach((h: any) => {
        send({ type: h.answer === "Sim" ? "ANSWER_YES" : "ANSWER_NO" })
      })
      setHistory(initialState.history)
    }
  }, [])

  useEffect(() => {
    if (currentStateValue === "check_funding" || history.length === 0) return

    localStorage.setItem(
      "legalInstrumentWizard",
      JSON.stringify({
        state: currentStateValue,
        history,
        timestamp: Date.now(),
      })
    )

    const currentUrlState = searchParams.get("state")
    if (currentUrlState !== currentStateValue) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("state", currentStateValue)
      router.replace(`?${params.toString()}`, { scroll: false })
    }
  }, [currentStateValue, history, router, searchParams])

  return (
    <div key={resetKey} className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <Card className={cn("border-none shadow-xl transition-all duration-500", isFinal ? "bg-primary/5 ring-1 ring-primary/20" : "bg-card")}>
        <CardHeader className="text-center pb-8 pt-10">
          <div className={cn("mx-auto p-4 rounded-full w-fit mb-6 transition-colors duration-500", isFinal ? "bg-primary text-primary-foreground shadow-lg scale-110" : "bg-muted text-muted-foreground")}>{isFinal ? <CheckCircle2 className="w-10 h-10" /> : <HelpCircle className="w-10 h-10" />}</div>
          <CardTitle className="text-3xl font-bold tracking-tight">{isFinal ? "Resultado da Análise" : "Classificação do Projeto"}</CardTitle>
          <CardDescription className="text-lg mt-2">{isFinal ? "Com base nas suas respostas, recomendamos o seguinte instrumento:" : "Responda as perguntas para identificarmos o instrumento ideal"}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center min-h-[240px] py-4 px-6">
          {isFinal ? (
            <div className="space-y-8 text-center w-full max-w-2xl animate-in fade-in zoom-in duration-500 delay-150">
              <div className="p-8 rounded-2xl bg-background shadow-sm border">
                <h3 className="text-2xl font-semibold text-primary mb-2">Instrumento Recomendado</h3>
                <Badge variant="secondary" className="text-xl px-6 py-2 h-auto rounded-lg font-bold uppercase tracking-wide mt-2">
                  {description}
                </Badge>
              </div>

              {currentStateValue === "result_review_scope" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">O fluxo atual não encontrou um enquadramento direto. Recomendamos revisar o escopo ou consultar o setor jurídico.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-3xl text-center space-y-8 animate-in fade-in slide-in-from-right-8 duration-300" key={currentStateValue}>
              <h3 className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground">{description}</h3>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center gap-6 pb-12 pt-4">
          {isFinal ? (
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button variant="outline" size="lg" onClick={handleReset} className="min-w-[160px] h-12 text-base">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reiniciar
              </Button>
              <Button onClick={handleConfirm} size="lg" className="min-w-[160px] h-12 text-base shadow-lg hover:shadow-xl transition-all">
                Confirmar Seleção
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <Button variant="outline" size="lg" onClick={() => handleAnswer("NO")} className="h-16 text-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors group">
                <ThumbsDown className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Não
              </Button>
              <Button size="lg" onClick={() => handleAnswer("YES")} className="h-16 text-lg shadow-md hover:shadow-lg hover:bg-primary/90 transition-all group">
                <ThumbsUp className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Sim
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

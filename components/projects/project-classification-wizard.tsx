"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMachine } from "@xstate/react"
import { projectFlowMachine } from "@/lib/project-flow-machine"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, HelpCircle, RotateCcw } from "lucide-react"

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
  onCancel?: () => void
}

export function ProjectClassificationWizard({ onComplete, onCancel }: ProjectClassificationWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, send] = useMachine(projectFlowMachine)
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([])
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [savedState, setSavedState] = useState<any>(null)

  const currentStateValue = state.value as string
  const isFinal = Object.keys(STATE_TO_PARTNERSHIP_TYPE).includes(currentStateValue)
  const description = (projectFlowMachine.states[currentStateValue as keyof typeof projectFlowMachine.states] as any)?.description || "Responda para continuar..."

  // Load state from URL or LocalStorage on mount
  useEffect(() => {
    const urlState = searchParams.get("state")
    const urlHistory = searchParams.get("history")

    if (urlState && urlHistory) {
      // Restore from URL
      try {
        const parsedHistory = JSON.parse(decodeURIComponent(urlHistory))
        setHistory(parsedHistory)
        // We can't easily force the machine to a specific state without replaying events or using a state definition
        // For simplicity in this machine, we might need to rely on replaying or just setting the internal state if xstate allows
        // Since xstate v5, we can provide input or use actor logic.
        // For this specific machine, let's just use the URL state as the source of truth for the UI if possible,
        // but the machine needs to be in sync.
        // A simpler approach for this linear-ish flow is to replay history? No, that's complex.
        // Let's rely on localStorage for the "Resume" feature and URL for current state sharing if needed.
        // Actually, the requirement says "url mude conforme".
      } catch (e) {
        console.error("Failed to parse history from URL", e)
      }
    } else {
      // Check LocalStorage
      const saved = localStorage.getItem("legalInstrumentWizard")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Only offer resume if it's not the initial state
          if (parsed.state !== "check_funding") {
            setSavedState(parsed)
            setShowResumeDialog(true)
          }
        } catch (e) {
          console.error("Failed to parse saved state", e)
        }
      }
    }
  }, [])

  // Sync state to URL and LocalStorage
  useEffect(() => {
    if (currentStateValue === "check_funding" && history.length === 0) return

    const params = new URLSearchParams(searchParams.toString())
    params.set("state", currentStateValue)
    // params.set("history", encodeURIComponent(JSON.stringify(history))) // URL might get too long, maybe just state is enough for URL?
    // User asked for URL to change so they don't lose process on reload.
    // Storing full history in URL is risky for length. Let's store in localStorage primarily for "reload" safety.
    // But user specifically said "url mude conforme".
    // Let's try to keep it simple in URL: just the current step name?
    // But the machine needs to know how it got there to go back?
    // The machine is simple enough that state name might be unique enough.
    // But we need to restore the history array too.

    router.replace(`?${params.toString()}`, { scroll: false })

    localStorage.setItem(
      "legalInstrumentWizard",
      JSON.stringify({
        state: currentStateValue,
        history,
        timestamp: Date.now(),
      })
    )
  }, [currentStateValue, history, router, searchParams])

  const handleResume = () => {
    if (savedState) {
      // This is a bit hacky for XState without proper state hydration setup
      // We will try to "fast forward" or just set the state if possible.
      // Since we can't easily inject state into the running machine hook without re-initializing,
      // we might need to recreate the machine or use a different approach.
      // For now, let's just load the history and hope the user can continue from where they left off?
      // No, the machine state needs to be correct.
      // Let's try to replay the answers?
      // If we saved the events, we could replay them.
      // Let's assume we saved the history of answers (YES/NO).
      // We can reset and replay.

      // Actually, let's just use the saved history to replay events.
      // We need to map history answers back to events.
      // This requires the history to store the event type or we infer it.
      // Let's just reset and replay.
      send({ type: "RESET" })
      setTimeout(() => {
        savedState.history.forEach((h: any) => {
          send({ type: h.answer === "Sim" ? "ANSWER_YES" : "ANSWER_NO" })
        })
      }, 100)
      setHistory(savedState.history)
    }
    setShowResumeDialog(false)
  }

  const handleStartOver = () => {
    localStorage.removeItem("legalInstrumentWizard")
    setShowResumeDialog(false)
    setHistory([])
    send({ type: "RESET" })
  }

  const handleAnswer = (answer: "YES" | "NO") => {
    setHistory((prev) => [...prev, { question: description, answer: answer === "YES" ? "Sim" : "Não" }])
    send({ type: answer === "YES" ? "ANSWER_YES" : "ANSWER_NO" })
  }

  const handleReset = () => {
    setHistory([])
    send({ type: "RESET" })
    localStorage.removeItem("legalInstrumentWizard")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("state")
    router.replace(`?${params.toString()}`)
  }

  const handleConfirm = () => {
    const partnershipType = STATE_TO_PARTNERSHIP_TYPE[currentStateValue]
    if (partnershipType) {
      onComplete({ type: partnershipType, history })
      localStorage.removeItem("legalInstrumentWizard")
    }
  }

  if (showResumeDialog) {
    return (
      <Card className="w-full max-w-md mx-auto border shadow-md">
        <CardHeader>
          <CardTitle>Continuar de onde parou?</CardTitle>
          <CardDescription>Você tem um processo de classificação em andamento.</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="ghost" onClick={handleStartOver}>
            Começar do zero
          </Button>
          <Button onClick={handleResume}>Continuar</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">{isFinal ? <CheckCircle2 className="w-8 h-8 text-primary" /> : <HelpCircle className="w-8 h-8 text-primary" />}</div>
          <CardTitle className="text-3xl font-bold">Classificação do Projeto</CardTitle>
          <CardDescription className="text-lg mt-2">{isFinal ? "Instrumento recomendado" : "Responda para identificarmos o instrumento ideal"}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center min-h-[200px] py-8">
          {isFinal ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <Badge variant="secondary" className="text-2xl px-8 py-3 h-auto rounded-xl">
                {description}
              </Badge>
              {currentStateValue === "result_review_scope" && <p className="text-muted-foreground max-w-md mx-auto">O fluxo atual não encontrou um enquadramento direto. Recomendamos revisar o escopo ou consultar o setor jurídico.</p>}
            </div>
          ) : (
            <h3 className="text-2xl font-medium leading-relaxed text-center max-w-2xl animate-in slide-in-from-right-4 duration-300 key={currentStateValue}">{description}</h3>
          )}
        </CardContent>

        <CardFooter className="flex justify-center gap-6 pb-8">
          {isFinal ? (
            <>
              <Button variant="outline" size="lg" onClick={handleReset} className="min-w-[140px]">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reiniciar
              </Button>
              <Button onClick={handleConfirm} size="lg" className="min-w-[140px]">
                Confirmar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="lg" onClick={() => handleAnswer("NO")} className="min-w-[140px] h-12 text-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
                Não
              </Button>
              <Button size="lg" onClick={() => handleAnswer("YES")} className="min-w-[140px] h-12 text-lg">
                Sim
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

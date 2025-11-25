"use client"

import React from "react"
import { useMachine } from "@xstate/react"
import { projectFlowMachine } from "@/lib/project-flow-machine"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, HelpCircle, RotateCcw } from "lucide-react"

// Map final states to PartnershipType enum values
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
  onComplete: (partnershipType: string) => void
  onCancel?: () => void
}

export function ProjectClassificationWizard({ onComplete, onCancel }: ProjectClassificationWizardProps) {
  const [state, send] = useMachine(projectFlowMachine)

  const currentStateValue = state.value as string
  const isFinal = Object.keys(STATE_TO_PARTNERSHIP_TYPE).includes(currentStateValue)
  // Helper to get description from state meta safely
  const description = (projectFlowMachine.states[currentStateValue as keyof typeof projectFlowMachine.states] as any)?.description || "Responda para continuar..."

  const handleConfirm = () => {
    const partnershipType = STATE_TO_PARTNERSHIP_TYPE[currentStateValue]
    if (partnershipType) {
      onComplete(partnershipType)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">{isFinal ? <CheckCircle2 className="w-8 h-8 text-primary" /> : <HelpCircle className="w-8 h-8 text-primary" />}</div>
        <CardTitle className="text-2xl">Classificação do Projeto</CardTitle>
        <CardDescription>{isFinal ? "Com base nas suas respostas, o instrumento jurídico recomendado é:" : "Responda as perguntas para identificar o tipo de parceria ideal."}</CardDescription>
      </CardHeader>

      <CardContent className="text-center py-6">
        {isFinal ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <Badge variant="secondary" className="text-xl px-6 py-2 h-auto">
              {description}
            </Badge>
            {currentStateValue === "result_review_scope" && <p className="text-muted-foreground mt-4">O fluxo atual não encontrou um enquadramento direto. Recomendamos revisar o escopo ou consultar o setor jurídico.</p>}
          </div>
        ) : (
          <h3 className="text-xl font-medium leading-relaxed animate-in slide-in-from-right-4 duration-300 key={currentStateValue}">{description}</h3>
        )}
      </CardContent>

      <CardFooter className="flex justify-center gap-4 pb-8">
        {isFinal ? (
          <>
            <Button variant="outline" onClick={() => send({ type: "RESET" })}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar
            </Button>
            <Button onClick={handleConfirm} size="lg">
              Confirmar e Continuar
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="lg" onClick={() => send({ type: "ANSWER_NO" })} className="min-w-[120px]">
              Não
            </Button>
            <Button size="lg" onClick={() => send({ type: "ANSWER_YES" })} className="min-w-[120px]">
              Sim
            </Button>
          </>
        )}
      </CardFooter>

      {!isFinal && onCancel && (
        <div className="text-center pb-4">
          <Button variant="link" size="sm" onClick={onCancel} className="text-muted-foreground">
            Pular assistente (definir manualmente depois)
          </Button>
        </div>
      )}
    </Card>
  )
}

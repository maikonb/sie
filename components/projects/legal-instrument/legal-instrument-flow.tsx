"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LegalInstrumentWizard } from "./wizard"
import { submitToSie } from "./sie-submission-mock"
import { LegalInstrumentForm } from "./legal-instrument-form"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function LegalInstrumentFlow({ project, returnTo }: { project: any; returnTo?: string }) {
  const [step, setStep] = useState<"WIZARD" | "SUBMITTING" | "FORM">("WIZARD")
  const [classification, setClassification] = useState<string>("")
  const [sieData, setSieData] = useState<any>(null)
  const router = useRouter()

  const handleWizardComplete = async (type: string) => {
    setClassification(type)
    setStep("SUBMITTING")

    try {
      const data = await submitToSie(project, type)
      setSieData(data)
      setStep("FORM")
    } catch (error) {
      console.error("Erro ao enviar para SIE", error)
      // Handle error appropriately
      setStep("WIZARD")
    }
  }

  if (step === "WIZARD") {
    return <LegalInstrumentWizard onComplete={handleWizardComplete} />
  }

  if (step === "SUBMITTING") {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="text-lg font-medium">Enviando para o SIE...</h3>
            <p className="text-sm text-muted-foreground">Aguarde enquanto validamos as informações.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <LegalInstrumentForm classification={classification} sieData={sieData} />
}

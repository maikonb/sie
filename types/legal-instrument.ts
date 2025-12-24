import { LegalInstrumentType } from "@prisma/client"

export type LegalInstrumentFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "email"
  | "cpf"
  | "cnpj"
  | "currency"

export interface LegalInstrumentFieldSpec {
  id: string
  name: string
  label: string
  type: LegalInstrumentFieldType
  required?: boolean
  options?: string[]
}

export type LegalInstrumentAnswerValue = string | number | null

export type LegalInstrumentAnswers = Record<string, LegalInstrumentAnswerValue>

export type ProjectClassificationAnswer = {
  question: string
  answer: "Sim" | "Não"
}

export interface ProjectClassificationResult {
  type: LegalInstrumentType
  history: ProjectClassificationAnswer[]
}

export interface ProjectClassificationSavedState {
  state?: string
  history: ProjectClassificationAnswer[]
  timestamp?: number
}

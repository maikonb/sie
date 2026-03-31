import { LegalInstrumentType } from "@prisma/client"

export const LEGAL_INSTRUMENT_TYPE_LABEL: Record<LegalInstrumentType, string> = {
  [LegalInstrumentType.PDI_AGREEMENT]: "Convênio de PD&I",
  [LegalInstrumentType.SERVICE_CONTRACT]: "Contrato de Serviços Técnicos",
  [LegalInstrumentType.APPDI_PRIVATE]: "APPDI com aporte privado",
  [LegalInstrumentType.APPDI_NO_FUNDING]: "APPDI sem aporte",
  [LegalInstrumentType.COOP_AGREEMENT]: "Acordo / Termo de Cooperação",
  [LegalInstrumentType.NDA]: "NDA / Termo de Confidencialidade",
  [LegalInstrumentType.TECH_TRANSFER]: "Licenciamento / Transferência de Tecnologia",
  [LegalInstrumentType.REVIEW_SCOPE]: "Rever escopo / enquadramento",
}

export function legalInstrumentTypeLabel(type: LegalInstrumentType | null | undefined): string {
  if (!type) return "N/A"
  return LEGAL_INSTRUMENT_TYPE_LABEL[type] ?? String(type)
}

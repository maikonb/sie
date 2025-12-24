import { Prisma, LegalInstrument, LegalInstrumentInstance } from "@prisma/client"

// ============================================================================
// VALIDATORS - Using Prisma.validator for type-safe database queries
// ============================================================================

/**
 * Validator for LegalInstrument with file relation
 */
export const legalInstrumentWithFileValidator = Prisma.validator<Prisma.LegalInstrumentDefaultArgs>()({
  include: {
    file: true,
  },
})

/**
 * Validator for LegalInstrumentInstance with file relation
 */
export const legalInstrumentInstanceWithFileValidator = Prisma.validator<Prisma.LegalInstrumentInstanceDefaultArgs>()({
  include: {
    file: true,
  },
})

/**
 * Validator for LegalInstrument list view (basic info)
 */
export const legalInstrumentListValidator = Prisma.validator<Prisma.LegalInstrumentDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    fileId: true,
    createdAt: true,
  },
})

// ============================================================================
// OUTPUT TYPES - Direct Prisma.validator payloads
// ============================================================================

/**
 * Response type for getLegalInstruments (list view)
 */
export type GetLegalInstrumentsResponse = Prisma.LegalInstrumentGetPayload<typeof legalInstrumentListValidator>[]

/**
 * Response type for getLegalInstrumentById
 */
export type GetLegalInstrumentByIdResponse = Prisma.LegalInstrumentGetPayload<typeof legalInstrumentWithFileValidator> | null

/**
 * Response type for updateLegalInstrument
 */
export type UpdateLegalInstrumentResponse = Prisma.LegalInstrumentGetPayload<typeof legalInstrumentWithFileValidator>

/**
 * Response type for previewLegalInstrument
 */
export interface PreviewLegalInstrumentResponse {
  preview: string
}

/**
 * Response type for saveLegalInstrumentAnswers
 */
export type SaveLegalInstrumentAnswersResponse = Prisma.LegalInstrumentInstanceGetPayload<typeof legalInstrumentInstanceWithFileValidator>

/**
 * Response type for checkExistingLegalInstrument
 */
export interface CheckExistingLegalInstrumentResponse {
  exists: boolean
}

// ============================================================================
// INPUT TYPES - Function parameters
// ============================================================================

/**
 * Input type for getLegalInstrumentById
 */
export interface GetLegalInstrumentByIdInput {
  id: string
}

/**
 * Input type for updateLegalInstrument
 */
export interface UpdateLegalInstrumentInput {
  id: string
  data: {
    fileKey?: string
    fieldsJson?: any[]
  }
}

/**
 * Input type for previewLegalInstrument
 */
export interface PreviewLegalInstrumentInput {
  id: string
  fieldsJson: any[]
  sampleValues: Record<string, any>
}

/**
 * Input type for saveLegalInstrumentAnswers
 */
export interface SaveLegalInstrumentAnswersInput {
  instanceId: string
  answers: Record<string, any>
}

/**
 * Input type for checkExistingLegalInstrument
 */
export interface CheckExistingLegalInstrumentInput {
  projectSlug: string
}

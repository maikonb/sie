import { Prisma } from "@prisma/client"
import type { LegalInstrumentAnswers, LegalInstrumentFieldSpec, LegalInstrumentAnswerValue } from "@/types/legal-instrument"

// ============================================================================
// VALIDATORS - Using Prisma.validator for type-safe database queries
// ============================================================================

/**
 * Validator for LegalInstrument with its current template attached.
 */
export const legalInstrumentWithTemplateValidator = Prisma.validator<Prisma.LegalInstrumentDefaultArgs>()({
  include: {
    templateFile: true,
  },
})

/**
 * Validator for LegalInstrumentInstance with version + template file and filled file.
 */
export const legalInstrumentInstanceWithVersionValidator = Prisma.validator<Prisma.LegalInstrumentInstanceDefaultArgs>()({
  include: {
    filledFile: true,
    legalInstrumentVersion: {
      include: {
        legalInstrument: true,
        templateFile: true,
      },
    },
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
    type: true,
    templateFileId: true,
    revisionKey: true,
    createdAt: true,
    updatedAt: true,
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
export type GetLegalInstrumentByIdResponse = Prisma.LegalInstrumentGetPayload<typeof legalInstrumentWithTemplateValidator> | null

/**
 * Response type for updateLegalInstrument
 */
export type UpdateLegalInstrumentResponse = Prisma.LegalInstrumentGetPayload<typeof legalInstrumentWithTemplateValidator>

/**
 * Response type for previewLegalInstrument
 */
export interface PreviewLegalInstrumentResponse {
  preview: string
}

/**
 * Response type for saveLegalInstrumentAnswers
 */
export type SaveLegalInstrumentAnswersResponse = Prisma.LegalInstrumentInstanceGetPayload<typeof legalInstrumentInstanceWithVersionValidator>

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
    fieldsJson?: LegalInstrumentFieldSpec[]
  }
}

/**
 * Input type for previewLegalInstrument
 */
export interface PreviewLegalInstrumentInput {
  id: string
  fieldsJson: LegalInstrumentFieldSpec[]
  sampleValues: Record<string, LegalInstrumentAnswerValue>
}

/**
 * Input type for saveLegalInstrumentAnswers
 */
export interface SaveLegalInstrumentAnswersInput {
  instanceId: string
  answers: LegalInstrumentAnswers
}

/**
 * Input type for checkExistingLegalInstrument
 */
export interface CheckExistingLegalInstrumentInput {
  projectSlug: string
}

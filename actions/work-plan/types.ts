import { Prisma, WorkPlan } from "@prisma/client"
import { type WorkPlanFormData } from "@/lib/schemas/work-plan"

// ============================================================================
// VALIDATORS - Using Prisma.validator for type-safe database queries
// ============================================================================

/**
 * Validator for basic WorkPlan query
 */
export const workPlanValidator = Prisma.validator<Prisma.WorkPlanDefaultArgs>()({})

// ============================================================================
// OUTPUT TYPES - Direct Prisma.validator payloads
// ============================================================================

/**
 * Response type for getWorkPlan
 */
export interface GetWorkPlanResponse {
  id: string
  projectId: string
  specificObjectives: string[]
  [key: string]: any
}

/**
 * Response type for upsertWorkPlan
 */
export interface UpsertWorkPlanResponse {
  success: boolean
  data?: Prisma.WorkPlanGetPayload<typeof workPlanValidator>
  error?: string
}

// ============================================================================
// INPUT TYPES - Function parameters
// ============================================================================

/**
 * Input type for getWorkPlan
 */
export interface GetWorkPlanInput {
  projectId: string
}

/**
 * Input type for upsertWorkPlan
 */
export interface UpsertWorkPlanInput {
  projectId: string
  data: WorkPlanFormData
}

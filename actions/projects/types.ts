import { Prisma, Project } from "@prisma/client"
import type { ProjectClassificationAnswer } from "@/types/legal-instrument"

// ============================================================================
// VALIDATORS - Using Prisma.validator for type-safe database queries
// ============================================================================

/**
 * Validator for Project with full relations including:
 * - user info
 * - legal instruments with instances and related data
 * - work plan
 * - audit logs
 */
export const projectWithRelationsValidator = Prisma.validator<Prisma.ProjectDefaultArgs>()({
  include: {
    user: {
      select: {
        name: true,
        email: true,
        color: true,
        imageFile: true,
      },
    },
    legalInstrumentInstance: {
      include: {
        filledFile: true,
        legalInstrumentVersion: {
          include: {
            legalInstrument: true,
            templateFile: true,
          },
        },
      },
    },
    workPlan: true,
    audits: {
      include: {
        user: { select: { name: true } },
      },
    },
  },
})

/**
 * Validator for Project with basic relations for list views
 */
export const projectWithBasicRelationsValidator = Prisma.validator<Prisma.ProjectDefaultArgs>()({
  include: {
    workPlan: { select: { id: true } },
    legalInstrumentInstance: {
      select: {
        status: true,
        legalInstrumentVersion: { select: { type: true } },
      },
    },
  },
})

/**
 * Validator for Projects for approval with user and legal instruments info
 */
export const projectsForApprovalValidator = Prisma.validator<Prisma.ProjectDefaultArgs>()({
  include: {
    user: {
      select: {
        name: true,
        email: true,
        color: true,
        imageFile: true,
      },
    },
    legalInstrumentInstance: {
      select: {
        status: true,
        legalInstrumentVersion: {
          select: {
            type: true,
            legalInstrument: { select: { name: true, description: true } },
          },
        },
      },
    },
    workPlan: {
      select: { id: true },
    },
  },
})

// ============================================================================
// OUTPUT TYPES - Direct Prisma.validator payloads
// ============================================================================

/**
 * Response type for getProjectBySlug
 * Returns full project with all relations or null
 */
export type GetProjectBySlugResponse = Prisma.ProjectGetPayload<typeof projectWithRelationsValidator> | null

/**
 * Response type for getAllProjects
 * Returns array of projects with basic relations
 */
export type GetAllProjectsResponse = Prisma.ProjectGetPayload<typeof projectWithBasicRelationsValidator>[]

/**
 * Response type for getProjectsForApproval
 * Returns array of projects with user and legal instruments info
 */
export type GetProjectsForApprovalResponse = Prisma.ProjectGetPayload<typeof projectsForApprovalValidator>[]

/**
 * Response type for createLegalInstrument
 * Returns success/error result
 */
export interface CreateLegalInstrumentResult {
  success: boolean
  error: string | null
  created?: Prisma.LegalInstrumentInstanceGetPayload<typeof legalInstrumentInstanceForProjectValidator>
}

/**
 * Validator for returning a LegalInstrumentInstance compatible with ProjectProvider state.
 */
export const legalInstrumentInstanceForProjectValidator = Prisma.validator<Prisma.LegalInstrumentInstanceDefaultArgs>()({
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
 * Response type for getProjectViewerContext
 * Indicates viewer role and allowed actions
 */
export interface ProjectViewerContext {
  mode: "owner" | "resource" | "approver" | "other"
  allowActions: boolean
}

/**
 * Response type for getProjectApprovalStats
 * Returns count statistics for approval dashboard
 */
export interface GetProjectApprovalStatsResponse {
  pendingReview: number
  underReview: number
  inReview: number
  approved: number
  rejected: number
  total: number
}

// ============================================================================
// INPUT TYPES - Function parameters
// ============================================================================

/**
 * Input type for createLegalInstrument
 */
export interface CreateLegalInstrumentInput {
  slug: string
  result: {
    type: string
    history?: ProjectClassificationAnswer[]
  }
}

/**
 * Input type for submitProjectForApproval
 */
export interface SubmitProjectForApprovalInput {
  slug: string
}

/**
 * Input type for startProjectReview
 */
export interface StartProjectReviewInput {
  slug: string
}

/**
 * Input type for approveProject
 */
export interface ApproveProjectInput {
  slug: string
}

/**
 * Input type for rejectProject
 */
export interface RejectProjectInput {
  slug: string
  reason: string
}

/**
 * Input type for updateProject
 */
export interface UpdateProjectInput {
  slug: string
  formData: FormData
}

/**
 * Input type for createProject
 */
export interface CreateProjectInput {
  formData: FormData
}

/**
 * Input type for getProjectBySlug
 */
export interface GetProjectBySlugInput {
  slug: string
}

/**
 * Input type for getProjectLegalInstrument
 */
export interface GetProjectLegalInstrumentInput {
  slug: string
}

/**
 * Input type for getProjectViewerContext
 */
export interface GetProjectViewerContextInput {
  slug: string
}

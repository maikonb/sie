import { ProjectStatus } from "@prisma/client"

export type ProjectsApprovalLocalFilters = {
  status: ProjectStatus[]
  assignedToMe: boolean
  hasWorkPlan: boolean
  missingWorkPlan: boolean
  hasLegalInstrument: boolean
  missingLegalInstrument: boolean
  dateStart: string
  dateEnd: string
}

export const DEFAULT_PROJECTS_APPROVAL_LOCAL_FILTERS: ProjectsApprovalLocalFilters = {
  status: [ProjectStatus.PENDING_REVIEW],
  assignedToMe: false,
  hasWorkPlan: false,
  missingWorkPlan: false,
  hasLegalInstrument: false,
  missingLegalInstrument: false,
  dateStart: "",
  dateEnd: "",
}

export function cloneProjectsApprovalLocalFilters(): ProjectsApprovalLocalFilters {
  return {
    ...DEFAULT_PROJECTS_APPROVAL_LOCAL_FILTERS,
    status: [...DEFAULT_PROJECTS_APPROVAL_LOCAL_FILTERS.status],
  }
}

export function getProjectsApprovalDefaultQueryParams(filters: ProjectsApprovalLocalFilters = DEFAULT_PROJECTS_APPROVAL_LOCAL_FILTERS): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {}

  if (filters.status.length > 0) params.status = filters.status
  if (filters.assignedToMe) params.assignedToMe = "true"
  if (filters.hasWorkPlan) params.hasWorkPlan = "true"
  if (filters.missingWorkPlan) params.missingWorkPlan = "true"
  if (filters.hasLegalInstrument) params.hasLegalInstrument = "true"
  if (filters.missingLegalInstrument) params.missingLegalInstrument = "true"
  if (filters.dateStart) params.dateStart = filters.dateStart
  if (filters.dateEnd) params.dateEnd = filters.dateEnd

  return params
}

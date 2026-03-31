import { ResourceMembersType } from "@/prisma/client"

// ============================================================================
// OUTPUT TYPES
// ============================================================================

/**
 * Response type for checkPermission
 */
export interface CheckPermissionResponse {
  can: boolean
}

/**
 * Response type for checkManyPermissions
 */
export type CheckManyPermissionsResponse = Record<string, boolean>

// ============================================================================
// INPUT TYPES - Function parameters
// ============================================================================

/**
 * Input type for checkPermission
 */
export interface CheckPermissionInput {
  slug: string
  referenceTable?: ResourceMembersType
  referenceId?: string
}

/**
 * Input type for checkManyPermissions
 */
export interface CheckManyPermissionsInput {
  slugs: string[]
}

import { Prisma, User } from "@prisma/client"

// ============================================================================
// VALIDATORS - Using Prisma.validator for type-safe database queries
// ============================================================================

/**
 * Validator for basic User query with standard fields
 */
export const userValidator = Prisma.validator<Prisma.UserDefaultArgs>()({})

/**
 * Validator for User list/basic info
 */
export const userBasicValidator = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    name: true,
    color: true,
  },
})

// ============================================================================
// OUTPUT TYPES - Direct Prisma.validator payloads and custom responses
// ============================================================================

/**
 * Response type for updateFirstAccess
 */
export interface UpdateFirstAccessResponse {
  success: boolean
}

/**
 * Response type for updateUser
 */
export interface UpdateUserResponse {
  success: boolean
  user: Prisma.UserGetPayload<typeof userValidator>
}

/**
 * Response type for requestEmailChange
 */
export interface RequestEmailChangeResponse {
  success: boolean
  error?: string
}

/**
 * Response type for verifyEmailChange
 */
export interface VerifyEmailChangeResponse {
  success: boolean
  error?: string
}

/**
 * Response type for requestOtp
 */
export interface RequestOtpResponse {
  success: boolean
  error?: string
}

// ============================================================================
// INPUT TYPES - Function parameters
// ============================================================================

/**
 * Input type for updateFirstAccess
 */
export interface UpdateFirstAccessInput {
  username: string
  imageKey?: string
}

/**
 * Input type for updateUser
 */
export interface UpdateUserInput {
  name: string
  imageKey?: string
  imageId?: string
  color?: string
}

/**
 * Input type for requestEmailChange
 */
export interface RequestEmailChangeInput {
  newEmail: string
}

/**
 * Input type for verifyEmailChange
 */
export interface VerifyEmailChangeInput {
  newEmail: string
  code: string
}

/**
 * Input type for requestOtp
 */
export interface RequestOtpInput {
  email: string
}

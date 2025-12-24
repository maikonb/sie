// ============================================================================
// OUTPUT TYPES
// ============================================================================

/**
 * Response type for generatePresignedUrl
 */
export interface GeneratePresignedUrlResponse {
  url: string
  [key: string]: any
}

// ============================================================================
// INPUT TYPES - Function parameters
// ============================================================================

/**
 * Input type for generatePresignedUrl
 */
export interface GeneratePresignedUrlInput {
  filename: string
  contentType: string
  folder: string
}

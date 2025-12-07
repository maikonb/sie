import { apiClient } from "@/lib/api-client"

export interface PermissionCheckPayload {
  slug: string
  referenceTable?: string
  referenceId?: string
}

export const permissionsService = {
  check: async (payload: PermissionCheckPayload) => {
    return apiClient.post<{ can: boolean }>("/permissions/check", payload)
  },
}

export default permissionsService

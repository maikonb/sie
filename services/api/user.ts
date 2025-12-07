import { apiClient } from "@/lib/api-client"

export interface RequestEmailChangePayload {
  newEmail: string
}

export interface VerifyEmailChangePayload {
  newEmail: string
  code: string
}

export interface UpdateProfilePayload {
  name: string
  imageKey?: string
}

export const userService = {
  requestEmailChange: async (payload: RequestEmailChangePayload) => {
    return apiClient.post("/user/email/request-change", payload)
  },

  verifyEmailChange: async (payload: VerifyEmailChangePayload) => {
    return apiClient.post("/user/email/verify-change", payload)
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    return apiClient.patch<any>("/user/update", payload)
  },
}

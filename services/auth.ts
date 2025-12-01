import { apiClient } from "@/lib/api-client"

export interface RequestOtpPayload {
  email: string
}

export const authService = {
  requestOtp: async (payload: RequestOtpPayload) => {
    return apiClient.post("/auth/otp/request", payload)
  },
}

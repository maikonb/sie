import { apiClient } from "@/lib/api-client"
import axios from "axios"

export interface PresignedUrlPayload {
  filename: string
  contentType: string
  folder: string
}

export interface PresignedUrlResponse {
  url: string
  key: string
}

export const fileService = {
  getPresignedUrl: async (payload: PresignedUrlPayload) => {
    return apiClient.post<PresignedUrlResponse>("/upload/presigned", payload)
  },

  uploadToS3: async (url: string, file: File) => {
    return axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    })
  },
}

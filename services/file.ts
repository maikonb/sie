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
    // Direct upload to S3/MinIO using the presigned URL
    // We use a fresh axios instance or the global one, but we need to avoid the baseURL and default headers of apiClient if they conflict
    // The presigned URL is absolute.
    return axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    })
  },
}

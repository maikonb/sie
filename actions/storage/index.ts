"use server"

import { getAuthSession } from "@/lib/api-utils"
import { fileService } from "@/lib/services/file"
import { GeneratePresignedUrlResponse } from "./types"

export async function generatePresignedUrl(
  filename: string,
  contentType: string,
  folder: string
): Promise<GeneratePresignedUrlResponse> {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return fileService.generatePresignedUrl(filename, contentType, folder)
}

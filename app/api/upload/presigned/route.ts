import { NextResponse } from "next/server"
import { getAuthSession, handleApiError, unauthorizedResponse } from "@/lib/api-utils"
import { fileService } from "@/lib/services/file"
import { z } from "zod"

const uploadSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  folder: z.string().optional().default("uploads"),
  size: z.number().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session) {
      return unauthorizedResponse()
    }

    const json = await req.json()
    const body = uploadSchema.parse(json)

    const { url, key, fileId } = await fileService.generatePresignedUrl(body.filename, body.contentType, body.folder)

    return NextResponse.json({ url, key, fileId })
  } catch (error) {
    return handleApiError(error)
  }
}

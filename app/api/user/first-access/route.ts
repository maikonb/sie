import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { fileService } from "@/lib/file-service"
import { handleApiError, unauthorizedResponse } from "@/lib/api-utils"

import { APP_ERRORS } from "@/lib/errors"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return unauthorizedResponse()
    }

    const json = await req.json()
    const username = json.username
    const imageKey = json.imageKey || json.imageId // Support both for backward compat or if frontend sends ID as key

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: APP_ERRORS.USER_INVALID_NAME.code }, { status: 400 })
    }

    let fileRecord

    if (imageKey) {
      try {
        fileRecord = await fileService.createFileFromS3(imageKey)
      } catch (error) {
        console.error("Failed to create file from S3:", error)
        // Optionally fail or just ignore image
      }
    }

    // Update User and Proponent
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: username,
        firstAccess: false,
        imageId: fileRecord?.id,
        proponent: {},
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating first access:", error)
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { getAuthSession, handleApiError, unauthorizedResponse } from "@/lib/api-utils"
import { fileService } from "@/lib/file-service"

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  image: z.string().optional(),
})

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session) {
      return unauthorizedResponse()
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { imageId: true },
    })

    const body = await req.json()
    // Allow imageKey or imageId (as key)
    const { name, imageKey, imageId } = updateProfileSchema
      .extend({
        imageKey: z.string().optional(),
        imageId: z.string().optional(),
        image: z.string().optional(),
      })
      .parse(body)

    const keyToUse = imageKey || imageId

    let fileRecord

    if (keyToUse) {
      try {
        fileRecord = await fileService.createFileFromS3(keyToUse)
      } catch (error) {
        console.error("Failed to create file from S3:", error)
      }
    }

    // Update User and Proponent
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name,
        imageId: fileRecord?.id,
      },
    })

    if (fileRecord && currentUser?.imageId && currentUser.imageId !== fileRecord.id) {
      await fileService.deleteFile(currentUser.imageId)
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    return handleApiError(error)
  }
}

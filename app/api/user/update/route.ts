import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { getAuthSession, handleApiError, unauthorizedResponse } from "@/lib/api-utils"

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

    const body = await req.json()
    const { name, image } = updateProfileSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email! },
      data: {
        name,
        ...(image && { image }),
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    return handleApiError(error)
  }
}

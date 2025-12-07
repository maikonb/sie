import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/config/auth"
import { prisma } from "@/lib/config/db"
import { handleApiError, unauthorizedResponse } from "@/lib/api-utils"
import { APP_ERRORS } from "@/lib/errors"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return unauthorizedResponse()
    }

    const { slug } = await params
    let project = null

    project = await prisma.project.findUnique({
      where: { slug: slug },
      include: {
        proponent: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                color: true,
                imageFile: true,
              },
            },
          },
        },
        legalInstruments: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: APP_ERRORS.GENERIC_ERROR.code }, { status: 404 })
    }

    const proponent = await prisma.proponent.findUnique({ where: { userId: session.user.id }, select: { id: true } })

    if (!proponent) {
      return NextResponse.json({ error: APP_ERRORS.GENERIC_ERROR.code }, { status: 403 })
    }

    // Ensure the user owns the project
    if (project.proponentId !== proponent.id) {
      return NextResponse.json({ error: APP_ERRORS.GENERIC_ERROR.code }, { status: 403 })
    }

    return NextResponse.json(project)
  } catch (error) {
    return handleApiError(error)
  }
}

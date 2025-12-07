import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/config/auth"
import { prisma } from "@/lib/config/db"
import { getProjectBySlug } from "@/actions/projects"
import { handleApiError, unauthorizedResponse } from "@/lib/api-utils"
import { APP_ERRORS } from "@/lib/errors"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return unauthorizedResponse()
    }

    const { slug } = await params
    const project = await getProjectBySlug(slug)

    if (!project) {
      return NextResponse.json({ error: APP_ERRORS.GENERIC_ERROR.code }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    return handleApiError(error)
  }
}

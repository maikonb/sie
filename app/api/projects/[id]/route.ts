import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      return new NextResponse("Invalid ID", { status: 400 })
    }

    const proponent = await prisma.proponent.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!proponent) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        proponent: true,
        partnerships: {
          where: { isPrimary: true },
          select: { type: true },
        },
      },
    })

    if (!project) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // Ensure the user owns the project
    if (project.proponentId !== proponent.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("[PROJECT_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

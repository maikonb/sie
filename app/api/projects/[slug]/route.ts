import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { slug } = await params
    const projectId = parseInt(slug)

    let project = null

    // 1. Try finding by ID if it's a number (backward compatibility)
    if (!isNaN(projectId)) {
      project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          proponent: true,
          partnerships: {
            where: { isPrimary: true },
            select: { type: true },
          },
        },
      })
    }

    // 2. If not found by ID, try finding by slug
    if (!project) {
      project = await prisma.project.findUnique({
        where: { slug: slug },
        include: {
          proponent: true,
          partnerships: {
            where: { isPrimary: true },
            select: { type: true },
          },
        },
      })
    }

    if (!project) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const proponent = await prisma.proponent.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!proponent) {
      return new NextResponse("Forbidden", { status: 403 })
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

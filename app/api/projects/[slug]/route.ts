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
    let project = null;
    
    project = await prisma.project.findUnique({
      where: { slug: slug },
      include: {
        proponent: {
          include: {
            user: {
              select: {
                color: true,
                imageFile: true,
              },
            }
          },
        },
        legalInstruments: true
      },
    })

    if (!project) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const proponent = await prisma.proponent.findUnique({
      where: { userId: session.user.id },
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

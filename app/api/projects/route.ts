import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const proponent = await prisma.proponent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!proponent) {
      return NextResponse.json([])
    }

    const projects = await prisma.project.findMany({
      where: {
        proponentId: proponent.id,
      },
      include: {
        legalInstruments: true
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("[PROJECTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

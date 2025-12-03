import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateUniqueSlug } from "@/lib/slug"
import { handleApiError, unauthorizedResponse } from "@/lib/api-utils"
import { APP_ERRORS } from "@/lib/errors"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return unauthorizedResponse()
    }

    const formData = await req.formData()
    const titulo = String(formData.get("titulo") || "").trim()
    const objetivos = String(formData.get("objetivos") || "").trim()
    const justificativa = String(formData.get("justificativa") || "").trim()
    const abrangencia = String(formData.get("abrangencia") || "").trim()

    if (!titulo || !objetivos || !justificativa || !abrangencia) {
      return NextResponse.json({ error: APP_ERRORS.GENERIC_ERROR.code }, { status: 400 })
    }

    const proponent = await prisma.proponent.findUnique({ where: { userId: session.user.id }, select: { id: true } })

    if (!proponent) {
      return NextResponse.json({ error: APP_ERRORS.GENERIC_ERROR.code }, { status: 404 })
    }

    const slug = await generateUniqueSlug(titulo)

    const project = await prisma.project.create({
      data: {
        title: titulo,
        slug,
        objectives: objetivos,
        justification: justificativa,
        scope: abrangencia,
        proponent: { connect: { id: proponent.id } },
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("[PROJECTS_POST]", error)
    return handleApiError(error)
  }
}
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
        legalInstruments: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("[PROJECTS_GET]", error)
    return handleApiError(error)
  }
}

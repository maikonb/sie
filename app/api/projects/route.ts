import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateUniqueSlug } from "@/lib/slug"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const titulo = String(formData.get("titulo") || "").trim()
    const objetivos = String(formData.get("objetivos") || "").trim()
    const justificativa = String(formData.get("justificativa") || "").trim()
    const abrangencia = String(formData.get("abrangencia") || "").trim()

    if (!titulo || !objetivos || !justificativa || !abrangencia) {
      return new NextResponse("Preencha todos os campos obrigatórios.", { status: 400 })
    }

    const proponent = await prisma.proponent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!proponent) {
      return new NextResponse("Proponente não encontrado para este usuário.", { status: 404 })
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
    return new NextResponse("Internal Error", { status: 500 })
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
    return new NextResponse("Internal Error", { status: 500 })
  }
}

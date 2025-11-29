"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function upsertWorkPlan(projectId: number, data: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  // Verify project ownership or permission (simplified for now)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { proponent: true },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  // TODO: Add proper permission check
  // if (project.proponent.email !== session.user.email) { ... }

  const workPlan = await prisma.workPlan.upsert({
    where: { projectId },
    create: {
      projectId,
      ...data,
    },
    update: {
      ...data,
    },
  })

  revalidatePath(`/projetos/${project.slug}`)
  return workPlan
}

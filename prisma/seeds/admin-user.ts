import { PrismaClient } from "../client";

export async function seedAdminUser(prisma: PrismaClient) {
  console.log("Seeding Admin User...")
  const adminRole = await prisma.role.findFirst({
    select: { id: true },
    where: {
      slug: "admin",
    },
  })

  if (!adminRole) {
    console.log()
    return
  }

  const roleId = adminRole.id

  const existing = await prisma.user.findUnique({
    where: { email: "admin@ufr.edu.br" },
  })

  if (existing) return existing

  const user = await prisma.user.create({
    data: {
      name: "admin",
      email: "admin@ufr.edu.br",
      emailVerified: new Date(),
      firstAccess: false,
      userRoles: {
        create: {
          roleId,
        },
      },
    },
  })

  return user
}
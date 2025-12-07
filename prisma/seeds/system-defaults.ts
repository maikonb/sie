import { PrismaClient, SystemDefaults } from "@/prisma/client"

type SeedSystemDefault = Partial<SystemDefaults> & { query: () => Promise<{ id: string | undefined }>}

export async function seedSystemDefaults(prisma: PrismaClient) {
  console.log("Seeding System Defaults...")

  const defaults: SeedSystemDefault[] = [
    {slug: "user_role", referenceTable: "Role", query: async () => { 
      const Role = await prisma.role.findFirst({ where: { slug: "user" } })
      return { id: Role?.id }
    }}
  ]

  // Upsert the default system defaults
  for (const defaultItem of defaults) {
    await prisma.systemDefaults.upsert({
      where: { slug: defaultItem.slug },
      create: { 
        slug: defaultItem.slug as string, 
        referenceTable: defaultItem.referenceTable, 
        referenceId: defaultItem.referenceId || (await defaultItem.query())?.id,
        value: defaultItem.value || null,
      },
      update: { 
        referenceTable: defaultItem.referenceTable, 
        referenceId: defaultItem.referenceId || (await defaultItem.query())?.id,
        value: defaultItem.value || null,
      },
    })
  }

  console.log("System defaults seeded.")
}

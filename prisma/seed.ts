import { PrismaClient } from "@prisma/client"
import { seedLegalInstruments } from "./seeds/legal-instruments"
import { seedPermissions } from "./seeds/permissions"
import { seedSystemDefaults } from "./seeds/system-defaults"

const prisma = new PrismaClient({})

async function main() {
  console.log("Start seeding...")

  await seedLegalInstruments(prisma)
  await seedPermissions(prisma)

  // Always last 
  await seedSystemDefaults(prisma)

  console.log("Seeding finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

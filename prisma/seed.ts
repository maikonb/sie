import { PrismaClient } from "@/prisma/client"
import { seedLegalInstruments } from "./seeds/legal-instruments"

const prisma = new PrismaClient()

async function main() {
  console.log("Start seeding...")

  await seedLegalInstruments(prisma)

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

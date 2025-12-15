import { PrismaClient } from "@prisma/client"
import { seedLegalInstruments } from "./seeds/legal-instruments"
import { seedPermissions } from "./seeds/permissions"
import { seedSystemDefaults } from "./seeds/system-defaults"
import { seedAdminUser } from "./seeds/admin-user"

const prisma = new PrismaClient({})

const devSeeds = [
  seedLegalInstruments, 
  seedPermissions, 
  seedAdminUser,
  seedSystemDefaults
]

const prodSeeds = [
  seedLegalInstruments, 
  seedPermissions, 
  seedSystemDefaults
]

function chooseSeeds(arg: string): Array<(prisma: PrismaClient) => Promise<any>> {
  if (arg === "prod" || arg === "production") return prodSeeds
  return devSeeds
}

async function main() {
  const arg = (process.argv[2] || process.env.SEED_ENV || "dev").toLowerCase()
  console.log(`Start ${arg} seeding...`)

  const seeds = chooseSeeds(arg)

  for (const seedFn of seeds) {
    await seedFn(prisma)
  }

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

import { prisma } from "@/lib/config/db"

export type SystemDefaultRecord = {
  referenceTable?: string | null
  referenceId?: string | null
  value?: string | null
}

export class SystemDefaultsService {
  private static cache: Record<string, SystemDefaultRecord> | null = null

  static async load(): Promise<Record<string, SystemDefaultRecord>> {
    if (SystemDefaultsService.cache) return SystemDefaultsService.cache

    const rows = await prisma.systemDefaults.findMany({ select: { slug: true, referenceTable: true, referenceId: true, value: true } })

    const map: Record<string, SystemDefaultRecord> = {}
    for (const r of rows) {
      map[r.slug] = {
        referenceTable: r.referenceTable ?? null,
        referenceId: r.referenceId ?? null,
        value: r.value ?? null,
      }
    }

    SystemDefaultsService.cache = map
    return map
  }

  static async get(slug: string): Promise<SystemDefaultRecord | undefined> {
    const map = await SystemDefaultsService.load()
    return map[slug]
  }

  static async getId(slug: string): Promise<string | undefined> {
    const def = await SystemDefaultsService.get(slug)
    return def?.referenceId ?? def?.value ?? undefined
  }

  static clear() {
    SystemDefaultsService.cache = null
  }
}

export const getSystemDefaultId = SystemDefaultsService.getId
export const loadSystemDefaults = SystemDefaultsService.load
export const getSystemDefault = SystemDefaultsService.get
export const clearSystemDefaultsCache = SystemDefaultsService.clear

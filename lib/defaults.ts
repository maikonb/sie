import { prisma } from "@/lib/db"

export type SystemDefaultRecord = {
  referenceTable?: string | null
  referenceId?: string | null
  value?: string | null
}

export class SystemDefaultsManager {
  private static cache: Record<string, SystemDefaultRecord> | null = null

  static async load(): Promise<Record<string, SystemDefaultRecord>> {
    if (SystemDefaultsManager.cache) return SystemDefaultsManager.cache

    const rows = await prisma.systemDefaults.findMany({ select: { slug: true, referenceTable: true, referenceId: true, value: true } })

    const map: Record<string, SystemDefaultRecord> = {}
    for (const r of rows) {
      map[r.slug] = {
        referenceTable: r.referenceTable ?? null,
        referenceId: r.referenceId ?? null,
        value: r.value ?? null,
      }
    }

    SystemDefaultsManager.cache = map
    return map
  }

  static async get(slug: string): Promise<SystemDefaultRecord | undefined> {
    const map = await SystemDefaultsManager.load()
    return map[slug]
  }

  static async getId(slug: string): Promise<string | undefined> {
    const def = await SystemDefaultsManager.get(slug)
    return def?.referenceId ?? def?.value ?? undefined
  }

  static clear() {
    SystemDefaultsManager.cache = null
  }
}

export const getSystemDefaultId = SystemDefaultsManager.getId
export const loadSystemDefaults = SystemDefaultsManager.load
export const getSystemDefault = SystemDefaultsManager.get
export const clearSystemDefaultsCache = SystemDefaultsManager.clear

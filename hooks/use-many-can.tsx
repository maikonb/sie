"use client"

import { useEffect, useState } from "react"
import { checkPermission } from "@/actions/permissions"

export type CanMap = Record<string, boolean>

export default function useManyCan(slugs: string[] | undefined) {
  const [canMap, setCanMap] = useState<CanMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function run() {
      setLoading(true)

      const unique = Array.from(new Set((slugs || []).filter(Boolean))) as string[]

      try {
        const pairs = await Promise.all(
          unique.map(async (s) => {
            try {
              const res = await checkPermission(s)
              return [s, !!res.can] as const
            } catch {
              return [s, false] as const
            }
          })
        )

        if (!isMounted) return

        const map = Object.fromEntries(pairs)
        setCanMap(map)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if ((slugs || []).length) run()
    else {
      setCanMap({})
      setLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [JSON.stringify(slugs || [])])

  return { canMap, loading }
}

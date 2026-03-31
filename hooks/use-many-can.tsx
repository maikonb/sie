"use client"

import { useEffect, useState } from "react"
import { checkManyPermissions } from "@/actions/permissions"

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
        const map = await checkManyPermissions(unique)

        if (!isMounted) return

        setCanMap(map)
      } catch (error) {
        console.error("Error checking permissions:", error)
        if (!isMounted) return
        // Em caso de erro, retorna todas como false
        setCanMap(unique.reduce((acc, s) => ({ ...acc, [s]: false }), {} as CanMap))
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

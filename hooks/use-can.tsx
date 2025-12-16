"use client"

import { useEffect, useState } from "react"
import { checkPermission } from "@/actions/permissions"
import { ResourceMembersType } from "@/prisma/client";

type CheckInput = { slug: string; referenceTable?: ResourceMembersType; referenceId?: string } | string

export function useCan(input: CheckInput) {
  const [can, setCan] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function check() {
      setLoading(true)
      setError(null)

      const payload = typeof input === "string" ? { slug: input } : input

      try {
        const result = await checkPermission(payload.slug, payload.referenceTable, payload.referenceId)
        if (!isMounted) return
        setCan(result.can)
      } catch (err: any) {
        if (!isMounted) return
        setError(err?.message || String(err))
        setCan(false)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    check()

    return () => {
      isMounted = false
    }
  }, [typeof input === "string" ? input : `${input.slug}:${input.referenceTable}:${input.referenceId}`])

  return { can, loading, error }
}

export default useCan

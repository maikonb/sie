"use server"

import { getAuthSession } from "@/lib/api-utils"
import PermissionsService from "@/lib/services/permissions"

export async function checkPermission(slug: string, referenceTable?: string, referenceId?: string) {
  const session = await getAuthSession()
  if (!session?.user?.id) return { can: false }

  const can = await PermissionsService.can(session.user.id, { slug, referenceTable, referenceId })
  return { can }
}

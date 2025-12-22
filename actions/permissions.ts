"use server"

import { getAuthSession } from "@/lib/api-utils"
import PermissionsService from "@/lib/services/permissions"
import { ResourceMembersType } from "@/prisma/client"

export async function checkPermission(slug: string, referenceTable?: ResourceMembersType, referenceId?: string) {
  const session = await getAuthSession()
  if (!session?.user?.id) return { can: false }

  const can = await PermissionsService.can(session.user.id, { slug, referenceTable, referenceId })
  return { can }
}

export async function checkManyPermissions(slugs: string[]) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return slugs.reduce((acc, slug) => ({ ...acc, [slug]: false }), {} as Record<string, boolean>)
  }

  const canMap = await PermissionsService.canMany(session.user.id, slugs)
  return canMap
}

import { ResourceMembersType } from "@prisma/client"
import { APP_ERRORS } from "@/lib/errors"
import { prisma } from "@/lib/config/db"

type ResourceCheck = {
  slug: string
  referenceTable?: ResourceMembersType
  referenceId?: string
}

export class PermissionsService {
  static async can(userId: string, { slug, referenceTable, referenceId }: ResourceCheck): Promise<boolean> {
    if (!userId || !slug) return false

    if (referenceTable && referenceId) {
      const has = await prisma.resourceMembers.findFirst({
        where: {
          userId,
          referenceTable,
          referenceId,
          permission: {
            slug,
          },
        },
      })

      return !!has
    }

    const rp = await prisma.rolePermission.findFirst({
      where: {
        permission: { slug },
        role: {
          userRoles: {
            some: { userId },
          },
        },
      },
      select: { id: true },
    })

    return !!rp
  }

  static async authorize(userId: string | null | undefined, check: ResourceCheck) {
    if (!userId) {
      throw new Error(APP_ERRORS.AUTH_UNAUTHORIZED.code)
    }

    const ok = await PermissionsService.can(userId, check)
    if (!ok) {
      throw new Error(APP_ERRORS.AUTH_UNAUTHORIZED.code)
    }
    return true
  }
}

export default PermissionsService

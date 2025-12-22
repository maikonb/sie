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

  static async canMany(userId: string, slugs: string[]): Promise<Record<string, boolean>> {
    if (!userId || !slugs.length) {
      return slugs.reduce((acc, slug) => ({ ...acc, [slug]: false }), {} as Record<string, boolean>)
    }

    // Busca todas as permissões do usuário de uma vez
    const userPermissions = await prisma.rolePermission.findMany({
      where: {
        permission: {
          slug: {
            in: slugs,
          },
        },
        role: {
          userRoles: {
            some: { userId },
          },
        },
      },
      select: {
        permission: {
          select: {
            slug: true,
          },
        },
      },
    })

    const allowedSlugs = new Set(userPermissions.map((rp) => rp.permission.slug))

    // Cria o mapa de permissões
    return slugs.reduce((acc, slug) => {
      acc[slug] = allowedSlugs.has(slug)
      return acc
    }, {} as Record<string, boolean>)
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

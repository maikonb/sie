import { type LucideIcon } from "lucide-react"

export interface NavTransform<TChanges extends object> {
  permission: string
  negate?: boolean
  changes: Partial<TChanges>
}

export type NavItemChanges = {
  title?: string
  icon?: LucideIcon
  permissionSlug?: string
  url?: string
  items?: NavItemChild[]
  isActive?: boolean
}

export type NavChildChanges = {
  title?: string
  url?: string
  permissionSlug?: string
  isActive?: boolean
}

export interface BaseNavItem {
  title: string
  icon?: LucideIcon
  permissionSlug?: string
  isActive?: boolean
  transforms?: NavTransform<NavItemChanges>[]
}

export interface NavItemWithUrl extends BaseNavItem {
  url: string
  items?: NavItemChild[]
}

export interface NavItemWithChildren extends BaseNavItem {
  url?: string
  items: NavItemChild[]
}

export interface NavItemChild {
  title: string
  url: string
  permissionSlug?: string
  isActive?: boolean
  transforms?: NavTransform<NavChildChanges>[]
}

export type NavItem = NavItemWithUrl | NavItemWithChildren

export function hasChildren(item: NavItem): item is NavItemWithChildren {
  return Array.isArray(item.items)
}

/**
 * Extrai todas as permissões de um array de items para validação
 */
export function extractPermissionSlugs(items: NavItem[]): string[] {
  const permissionSlugs = items.flatMap((item) => (item.permissionSlug ? [item.permissionSlug] : []))

  const childPermissions = items
    .filter(hasChildren)
    .flatMap((item) => item.items.flatMap((child) => (child.permissionSlug ? [child.permissionSlug] : [])))

  return Array.from(new Set([...permissionSlugs, ...childPermissions]))
}

/**
 * Extrai todas as permissões de transformações
 */
export function extractTransformPermissions(items: NavItem[]): string[] {
  const transforms = items.flatMap((item) => item.transforms?.map((t) => t.permission) || [])

  const childTransforms = items
    .filter(hasChildren)
    .flatMap((item) => item.items.flatMap((child) => child.transforms?.map((t) => t.permission) || []))

  return Array.from(new Set([...transforms, ...childTransforms]))
}

/**
 * Aplica transformações baseadas em permissões
 */
export function applyTransforms(item: NavItem, canMap: Record<string, boolean>): NavItem {
  let out: NavItem = { ...item }

  if (item.transforms) {
    for (const transform of item.transforms) {
      const has = !!canMap[transform.permission]
      const apply = transform.negate ? !has : has
      if (apply) {
        out = { ...out, ...transform.changes } as NavItem
      }
    }
  }

  if (hasChildren(item)) {
    out = {
      ...out,
      items: item.items.map((child) => {
      let childOut = { ...child }
      if (child.transforms) {
        for (const transform of child.transforms) {
          const has = !!canMap[transform.permission]
          const apply = transform.negate ? !has : has
          if (apply) {
            childOut = { ...childOut, ...transform.changes }
          }
        }
      }
      return childOut
      }),
    } as NavItem
  }

  return out
}

/**
 * Verifica se um item deve ser renderizado (se tem permissão e se não é um grupo vazio)
 */
export function shouldRenderItem(item: NavItem, hasPermission: boolean): boolean {
  // Se não tem permissão, não renderiza
  if (item.permissionSlug && !hasPermission) {
    return false
  }

  // Se é um item com children, verifica se há ao menos um filho com permissão
  if (hasChildren(item)) {
    const children = item.items
    // Se não tem URL própria e todos os filhos estão sem permissão, não renderiza
    return children.some((child) => !child.permissionSlug || hasPermission)
  }

  return true
}

/**
 * Processa itens: aplica transformações e filtra por permissões
 */
export function processNavItems(
  items: NavItem[],
  canMap: Record<string, boolean>
): { item: NavItem; hasPermission: boolean }[] {
  // 1. Primeiro aplica transformações
  const transformedItems = items.map((item) => applyTransforms(item, canMap))

  // 2. Depois filtra itens visíveis
  return transformedItems
    .map((item) => {
      const hasPermission = !item.permissionSlug || !!canMap[item.permissionSlug]

      // Se é um grupo com children, filtra os filhos
      if (hasChildren(item)) {
        const visibleChildren = item.items.filter(
          (child) => !child.permissionSlug || !!canMap[child.permissionSlug]
        )

        // Se não tem URL e nenhum filho é visível, marca como não renderizável
        if (!item.url && visibleChildren.length === 0) {
          return { item: { ...item, items: visibleChildren } as NavItem, hasPermission: false }
        }

        return { item: { ...item, items: visibleChildren } as NavItem, hasPermission: hasPermission }
      }

      return { item, hasPermission }
    })
    .filter(({ item, hasPermission }) => shouldRenderItem(item, hasPermission))
}

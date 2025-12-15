import * as React from "react"
import { type LucideIcon } from "lucide-react"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/providers/sidebar"
import PermissionGuard from "@/components/permissions/permission-guard"
import useManyCan from "@/hooks/use-many-can"
import { Skeleton } from "@/components/ui/skeleton"

export function NavSecondary({
  items,
  ...props
}: {
  items: (
    | {
        title: string
        url: string
        icon: LucideIcon
        permissionSlug?: string
        transforms?: { permission: string; negate?: boolean; changes: Partial<{ title: string; url: string; icon: LucideIcon; permissionSlug?: string }> }[]
      }
    | any
  )[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const transformPermissions = items.flatMap((i) => i.transforms?.map((t: any) => t.permission) || [])
  const permissionSlugs = items.flatMap((i) => (i.permissionSlug ? [i.permissionSlug] : []))
  const allPermissions = Array.from(new Set([...transformPermissions, ...permissionSlugs]))

  const { canMap, loading } = useManyCan(allPermissions)

  const transformed = items.map((i) => {
    let out = { ...i }
    if (i.transforms) {
      for (const t of i.transforms) {
        const has = !!canMap[t.permission]
        const apply = t.negate ? !has : has
        if (apply) out = { ...out, ...t.changes }
      }
    }
    return out
  })

  if (loading) {
    return (
      <SidebarGroup {...props}>
        <SidebarGroupContent>
          <SidebarMenu>
            {new Array(3).fill(0).map((_, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton asChild size="sm">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {transformed.map((item) => (
            <SidebarMenuItem key={item.title}>
              <PermissionGuard permission={item.permissionSlug}>
                <SidebarMenuButton asChild size="sm">
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </PermissionGuard>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

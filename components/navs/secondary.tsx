import * as React from "react"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/providers/sidebar"
import PermissionGuard from "@/components/permissions/permission-guard"
import useManyCan from "@/hooks/use-many-can"
import { Skeleton } from "@/components/ui/skeleton"
import { extractPermissionSlugs, extractTransformPermissions, processNavItems, type NavItem } from "@/lib/services/nav-items"

export function NavSecondary({
  items,
  ...props
}: {
  items: NavItem[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const transformPermissions = extractTransformPermissions(items)
  const permissionSlugs = extractPermissionSlugs(items)
  const allPermissions = Array.from(new Set([...transformPermissions, ...permissionSlugs]))

  const { canMap, loading } = useManyCan(allPermissions)

  const visibleItems = processNavItems(items, canMap)

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
          {visibleItems.map(({ item }) => (
            <SidebarMenuItem key={item.title}>
              <PermissionGuard permission={item.permissionSlug} canMap={canMap}>
                {item.url ? (
                  <SidebarMenuButton asChild size="sm">
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                ) : null}
              </PermissionGuard>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

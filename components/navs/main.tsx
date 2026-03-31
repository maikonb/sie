"use client"

import { ChevronRight } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/providers/sidebar"
import PermissionGuard from "@/components/permissions/guard"
import useManyCan from "@/hooks/use-many-can"
import { Skeleton } from "@/components/ui/skeleton"
import { extractPermissionSlugs, extractTransformPermissions, processNavItems, type NavItem } from "@/lib/services/nav-items"

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  const transformPermissions = extractTransformPermissions(items)
  const permissionSlugs = extractPermissionSlugs(items)
  const allPermissions = Array.from(new Set([...transformPermissions, ...permissionSlugs]))

  const { canMap, loading } = useManyCan(allPermissions)

  const visibleItems = processNavItems(items, canMap)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      {loading ? (
        <SidebarMenu>
          {new Array(4).fill(0).map((_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuButton asChild>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      ) : (
        <SidebarMenu>
          {visibleItems.map(({ item }) => (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
              <SidebarMenuItem>
                <PermissionGuard permission={item.permissionSlug} canMap={canMap}>
                  {item.url ? (
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  ) : (
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  )}

                  {item.items?.length ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <PermissionGuard permission={subItem.permissionSlug} canMap={canMap}>
                                <SidebarMenuSubButton asChild>
                                  <a href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </PermissionGuard>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : null}
                </PermissionGuard>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      )}
    </SidebarGroup>
  )
}

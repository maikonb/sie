"use client"

import { ChevronRight, MoreHorizontal, Share, Trash2 } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from "@/components/providers/sidebar"
import PermissionGuard from "@/components/permissions/guard"
import useManyCan from "@/hooks/use-many-can"
import { Skeleton } from "@/components/ui/skeleton"
import { extractPermissionSlugs, extractTransformPermissions, processNavItems, type NavItem } from "@/lib/services/nav-items"

export function NavProjects({
  items,
}: {
  items: NavItem[]
}) {
  const { isMobile } = useSidebar()
  const transformPermissions = extractTransformPermissions(items)
  const permissionSlugs = extractPermissionSlugs(items)
  const allPermissions = Array.from(new Set([...transformPermissions, ...permissionSlugs]))

  const { canMap, loading } = useManyCan(allPermissions)

  const visibleItems = processNavItems(items, canMap)
  if (loading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <Skeleton className="h-4 w-24" />
        </SidebarGroupLabel>
        <SidebarMenu>
          {new Array(3).fill(0).map((_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuButton asChild>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {visibleItems.map(({ item }) => (
          <Collapsible key={item.title} asChild defaultOpen={(item as any).isActive}>
            <SidebarMenuItem>
              <PermissionGuard permission={item.permissionSlug} canMap={canMap}>
                {item.url ? (
                  <>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {!(item as any).items?.length ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction showOnHover>
                            <MoreHorizontal />
                            <span className="sr-only">More</span>
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48" side={isMobile ? "bottom" : "right"} align={isMobile ? "end" : "start"}>
                          <DropdownMenuItem>
                            <Share className="text-muted-foreground" />
                            <span>Share Project</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Trash2 className="text-muted-foreground" />
                            <span>Delete Project</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </>
                ) : (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                )}

                {(item as any).items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {(item as any).items?.map((subItem: any) => (
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
    </SidebarGroup>
  )
}

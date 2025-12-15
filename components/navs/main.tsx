"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/providers/sidebar"
import PermissionGuard from "@/components/permissions/permission-guard"
import useManyCan from "@/hooks/use-many-can"
import { Skeleton } from "@/components/ui/skeleton"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    permissionSlug?: string
    items?: {
      title: string
      url: string
      permissionSlug?: string
    }[]
  }[]
}) {
  // Collect transform permissions and explicit permission slugs from items and subitems
  const transformPermissions = items.flatMap((it) => [
    ...(it as any).transforms?.map((t: any) => t.permission) || [],
    ...((it.items || []) as any[]).flatMap((s) => s.transforms?.map((t: any) => t.permission) || []),
  ])

  const permissionSlugs = items.flatMap((it) => [(it as any).permissionSlug].filter(Boolean)).concat(
    items.flatMap((it) => (it.items || []).flatMap((s: any) => [s.permissionSlug].filter(Boolean)))
  )

  const allPermissions = Array.from(new Set([...transformPermissions, ...permissionSlugs]))

  const { canMap, loading } = useManyCan(allPermissions)

  const transformedItems = items.map((it) => {
    let out: any = { ...it }
    if ((it as any).transforms) {
      for (const t of (it as any).transforms) {
        const has = !!canMap[t.permission]
        const apply = t.negate ? !has : has
        if (apply) out = { ...out, ...t.changes }
      }
    }

    if (it.items) {
      out.items = it.items.map((s: any) => {
        let so = { ...s }
        if (s.transforms) {
          for (const t of s.transforms) {
            const has = !!canMap[t.permission]
            const apply = t.negate ? !has : has
            if (apply) so = { ...so, ...t.changes }
          }
        }
        return so
      })
    }

    return out
  })

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
          {transformedItems.map((item) => (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
              <SidebarMenuItem>
                <PermissionGuard permission={item.permissionSlug}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
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
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <PermissionGuard permission={subItem.permissionSlug}>
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

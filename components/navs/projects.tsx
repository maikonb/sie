"use client"

import { Folder, MoreHorizontal, Share, Trash2, type LucideIcon } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/providers/sidebar"
import PermissionGuard from "@/components/permissions/permission-guard"
import useManyCan from "@/hooks/use-many-can"
import { Skeleton } from "@/components/ui/skeleton"

export function NavProjects({
  projects,
}: {
  projects: (
    | {
        name: string
        url: string
        icon: LucideIcon
        permissionSlug?: string
        transforms?: {
          permission: string
          negate?: boolean
          changes: Partial<{ name: string; url: string; icon: LucideIcon; permissionSlug?: string }>
        }[]
      }
    | any
  )[]
}) {
  const { isMobile } = useSidebar()
  const transformPermissions = projects.flatMap((p) => p.transforms?.map((t: any) => t.permission) || [])
  const permissionSlugs = projects.flatMap((p) => (p.permissionSlug ? [p.permissionSlug] : []))
  const allPermissions = Array.from(new Set([...transformPermissions, ...permissionSlugs]))

  const { canMap, loading } = useManyCan(allPermissions)

  const transformed = projects.map((p) => {
    let out = { ...p }
    if (p.transforms) {
      for (const t of p.transforms) {
        const has = !!canMap[t.permission]
        const apply = t.negate ? !has : has
        if (apply) {
          out = { ...out, ...t.changes }
        }
      }
    }
    return out
  })
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
        {transformed.map((item) => (
          <SidebarMenuItem key={item.name}>
            <PermissionGuard permission={item.permissionSlug}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" side={isMobile ? "bottom" : "right"} align={isMobile ? "end" : "start"}>
                  <DropdownMenuItem>
                    <Folder className="text-muted-foreground" />
                    <span>View Project</span>
                  </DropdownMenuItem>
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
            </PermissionGuard>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

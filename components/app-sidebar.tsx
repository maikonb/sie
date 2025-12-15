"use client"

import * as React from "react"
import { BookOpen, Bot, Frame, LifeBuoy, Map, PieChart, Send, Settings2, SquareTerminal } from "lucide-react"

import { NavMain } from "@/components/navs/main"
import { NavProjects } from "@/components/navs/projects"
import { NavSecondary } from "@/components/navs/secondary"
import { NavUser } from "@/components/navs/user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/providers/sidebar"

import { Logo } from "./logo"
import Link from "next/link"
import { useSession } from "next-auth/react"


const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Configurações",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Instrumentos Jurídicos",
          url: "/admin/legal-instruments",
          icon: BookOpen,
          permissionSlug: "legal_instruments.manage",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Meus Projetos",
      url: "/projetos",
      icon: Frame,
      transforms: [
        {
          permission: "projects.view.all",
          changes: { name: "Projetos" },
        },
      ],
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession()

  const user = {
    name: session?.user?.name || "Usuário",
    email: session?.user?.email || "usuario@ufr.edu.br",
    avatar: session?.user?.image || "",
    color: session?.user?.color || "bg-sidebar-primary",
  }



  return (
    <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/projetos">
                <Logo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} isLoading={status === "loading"} />
      </SidebarFooter>
    </Sidebar>
  )
}

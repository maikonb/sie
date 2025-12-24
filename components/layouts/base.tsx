import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/layouts/ui/header"
import { SidebarInset, SidebarProvider } from "@/components/providers/sidebar"
import { ProjectProvider } from "../providers/project"

export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <ProjectProvider>
              <div className="flex flex-1 flex-col">{children}</div>
            </ProjectProvider>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

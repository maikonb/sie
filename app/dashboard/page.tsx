import { AppSidebar } from "@/components/app-sidebar"
import { NewProject } from "@/components/new-project"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default function Page() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col p-4">
                <div className="p-4 bg-muted/50 aspect-video rounded-xl">
                  <NewProject />
                </div>  
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

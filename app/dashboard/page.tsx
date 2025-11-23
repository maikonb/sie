import { NewProject } from "@/components/new-project"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default function Page() {
  return (
    <div className="p-4 bg-muted/50 aspect-video rounded-xl">
      <NewProject />
    </div> 
  )
}

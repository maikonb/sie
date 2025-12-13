import { ProjectProvider } from "@/components/providers/project-context"

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <ProjectProvider>{children}</ProjectProvider>
}

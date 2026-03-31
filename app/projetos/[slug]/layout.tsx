import { ProjectProvider } from "@/components/providers/project"

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <ProjectProvider>{children}</ProjectProvider>
}

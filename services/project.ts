import { apiClient } from "@/lib/api-client"
import { Project } from "@prisma/client"

export const projectService = {
  getAll: async () => {
    return apiClient.get<any>("/projects")
  },

  getBySlug: async (slug: string) => {
    return apiClient.get<any>(`/projects/${slug}`)
  },

  create: async (formData: FormData) => {
    return apiClient.post<Project>("/projects", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
}

import { prisma } from "@/lib/config/db"
import { sendByTemplate, getEmailsByPermissionSlug } from "./email"
import { EmailTemplateKey, EmailTemplateVars } from "../emails/types"

export type NotificationType = "PROJECT_STATUS" | "SYSTEM" | "REMINDER"

interface CreateNotificationOptions<K extends EmailTemplateKey> {
  userId: string
  title: string
  message: string
  type: NotificationType
  url?: string
  emailTemplate?: {
    key: K
    vars: EmailTemplateVars[K]
  }
}

export class NotificationService {
  /**
   * Creates a notification in the database and optionally sends an email.
   */
  static async create<K extends EmailTemplateKey>(options: CreateNotificationOptions<K>) {
    const { userId, title, message, type, url, emailTemplate } = options

    // 1. Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        url,
      },
    })

    // 2. Send email if template is provided
    if (emailTemplate) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      })

      if (user?.email) {
        await sendByTemplate(emailTemplate.key, emailTemplate.vars, user.email)
      }
    }

    return notification
  }

  /**
   * Notifies a specific user about a project update.
   */
  static async notifyUser(userId: string, title: string, message: string, url: string, emailInfo?: { key: EmailTemplateKey; vars: any }) {
    return this.create({
      userId,
      title,
      message,
      type: "PROJECT_STATUS",
      url,
      emailTemplate: emailInfo,
    })
  }

  /**
   * Notifies all users with a specific permission (e.g., admins).
   */
  static async notifyByPermission(permissionSlug: string, title: string, message: string, url: string, emailInfo?: { key: EmailTemplateKey; vars: any }) {
    const users = await prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              rolePermissions: {
                some: {
                  permission: { slug: permissionSlug },
                },
              },
            },
          },
        },
      },
      select: { id: true, email: true },
    })

    return Promise.all(
      users.map((user) =>
        this.create({
          userId: user.id,
          title,
          message,
          type: "PROJECT_STATUS",
          url,
          emailTemplate: emailInfo ? { key: emailInfo.key, vars: emailInfo.vars } : undefined,
        })
      )
    )
  }

  // Specialized Project Notifications

  static async notifyAdminsOfNewSubmission(project: { id: string; title: string; slug: string; user: { name?: string | null } }) {
    /* Temporariamente desativado a pedido do usuário para evitar sobrecarga de e-mails nos admins
    const emails = await getEmailsByPermissionSlug("projects.approve")
    if (!emails.length) return

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const reviewUrl = `${baseUrl}/admin/projetos/${project.slug}/review`

    // For admins, we maintain only email notifications for now
    return Promise.all(
      emails.map((to) =>
        sendByTemplate(
          "PROJECT_SUBMITTED",
          {
            projectTitle: project.title,
            submitterName: project.user.name ?? "Usuário",
            reviewUrl,
          },
          to
        )
      )
    )
    */
    return null
  }

  static async notifyUserOfApproval(project: { title: string; slug: string; userId: string; user: { email?: string | null } }, approver: { name?: string | null }) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const projectUrl = `${baseUrl}/projetos/${project.slug}`

    return this.notifyUser(project.userId, "Projeto Aprovado!", `Seu projeto "${project.title}" foi aprovado por ${approver.name ?? "um administrador"}.`, `/projetos/${project.slug}`, {
      key: "PROJECT_APPROVED",
      vars: { projectTitle: project.title, approverName: approver.name ?? "Administrador", projectUrl },
    })
  }

  static async notifyUserOfRejection(project: { title: string; slug: string; userId: string; user: { email?: string | null } }, reason: string, approver: { name?: string | null }) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const projectUrl = `${baseUrl}/projetos/${project.slug}`

    return this.notifyUser(project.userId, "Projeto Rejeitado", `Seu projeto "${project.title}" foi rejeitado. Motivo: ${reason}`, `/projetos/${project.slug}`, {
      key: "PROJECT_REJECTED",
      vars: { projectTitle: project.title, approverName: approver.name ?? "Administrador", reason, projectUrl },
    })
  }
}

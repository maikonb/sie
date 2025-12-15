import { notFound } from "next/navigation"
import { getAuthSession } from "@/lib/api-utils"
import PermissionsService from "./services/permissions"

export async function requirePermissionOr404(check: { slug: string; referenceTable?: string; referenceId?: string }) {
  const session = await getAuthSession()
  if (!session?.user?.id) return notFound()

  const ok = await PermissionsService.can(session.user.id, check)
  if (!ok) return notFound()

  return session
}

export default requirePermissionOr404

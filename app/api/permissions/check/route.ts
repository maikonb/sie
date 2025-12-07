import { NextResponse } from "next/server"
import { getAuthSession, handleApiError, unauthorizedResponse } from "@/lib/api-utils"
import PermissionsService from "@/lib/permissions"

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorizedResponse()

    const body = await req.json()
    const { slug, referenceTable, referenceId } = body || {}

    if (!slug) {
      return NextResponse.json({ error: "missing_slug" }, { status: 400 })
    }

    const can = await PermissionsService.can(session.user.id, { slug, referenceTable, referenceId })
    return NextResponse.json({ can }, { status: 200 })
  } catch (err) {
    return handleApiError(err)
  }
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { APP_ERRORS, getAppError } from "@/lib/errors"

export async function getAuthSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  return session
}

function findAppErrorByMessage(message: string) {
  return Object.values(APP_ERRORS).find((e) => e.message === message)
}

export function handleApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: APP_ERRORS.GENERIC_ERROR.code }, { status: 400 })
  }

  if (error instanceof Error) {
    // If the thrown error already contains a known APP_ERROR code, return it
    const byCode = getAppError(error.message)
    if (byCode && Object.values(APP_ERRORS).some((e) => e.code === byCode.code)) {
      return NextResponse.json({ error: byCode.code }, { status: 400 })
    }

    // If the thrown error matches a known APP_ERROR message, map to its code
    const byMessage = findAppErrorByMessage(error.message)
    if (byMessage) {
      return NextResponse.json({ error: byMessage.code }, { status: 400 })
    }
  }

  console.error("API Error:", error)
  return NextResponse.json({ error: APP_ERRORS.GENERIC_ERROR.code }, { status: 500 })
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: APP_ERRORS.AUTH_UNAUTHORIZED.code }, { status: 401 })
}

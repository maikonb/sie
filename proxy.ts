import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const { pathname } = req.nextUrl

  const authPaths = ["/auth/login", "/auth/otp"]
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))
  if (!token && isAuthPath) {
    return NextResponse.next()
  }

  if (token && isAuthPath) {
    const dashboardUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  if (!token) {
    const loginUrl = new URL("/auth/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  const isFirstAccess = token.firstAccess as boolean
  const isFirstAccessPage = pathname === "/projetos/primeiro-acesso"

  if (isFirstAccess && !isFirstAccessPage) {
    return NextResponse.redirect(new URL("/projetos/primeiro-acesso", req.url))
  }

  if (!isFirstAccess && isFirstAccessPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
}

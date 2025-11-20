import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function proxy(request: NextRequest) {
  // TODO: verificar se o usuário está autenticado
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
 
export const config = {
  matcher: '/',
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hash } from "bcryptjs"
import { APP_ERRORS } from "@/lib/errors"
import { sendOtpEmail } from "@/lib/email"

function isUfr(email?: string | null) {
  return !!email && email.toLowerCase().endsWith("@ufr.edu.br")
}

export async function POST(req: Request) {
  const { email } = await req.json()
  const clean = (email ?? "").toLowerCase().trim()

  if (!isUfr(clean)) {
    return NextResponse.json({ ok: false, error: APP_ERRORS.AUTH_INVALID_DOMAIN.code }, { status: 400 })
  }

  // Rate Limiting: 1 request per 25 seconds
  const lastOtp = await prisma.otpCode.findFirst({
    where: {
      email: clean,
      sentAt: { gt: new Date(Date.now() - 25 * 1000) },
    },
  })

  if (lastOtp) {
    return NextResponse.json({ ok: false, error: APP_ERRORS.AUTH_TOO_MANY_REQUESTS.code }, { status: 429 })
  }

  // gere um código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const codeHash = await hash(code, 10)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  await prisma.otpCode.create({
    data: { email: clean, codeHash, expiresAt },
  })

  sendOtpEmail(clean, code)

  return NextResponse.json({ ok: true })
}

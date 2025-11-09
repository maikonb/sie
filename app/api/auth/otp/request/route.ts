import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import nodemailer from "nodemailer";

function isUfr(email?: string | null) {
  return !!email && email.toLowerCase().endsWith("@ufr.edu.br");
}

export async function POST(req: Request) {
  const { email } = await req.json();
  const clean = (email ?? "").toLowerCase().trim();

  if (!isUfr(clean)) {
    return NextResponse.json({ ok: false, error: "Email deve ser @ufr.edu.br" }, { status: 400 });
  }

  // gere um código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.otpCode.create({
    data: { email: clean, codeHash, expiresAt },
  });

  // SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "no-reply@ufr.edu.br",
    to: clean,
    subject: "Seu código de acesso",
    text: `Seu código é: ${code} (expira em 10 minutos).`,
    html: `<p>Seu código é: <b>${code}</b></p><p>Expira em 10 minutos.</p>`,
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import {
  getAuthSession,
  handleApiError,
  unauthorizedResponse,
} from "@/lib/api-utils";
import { APP_ERRORS } from "@/lib/errors";

const requestEmailChangeSchema = z.object({
  newEmail: z
    .string()
    .email("E-mail inválido")
    .endsWith("@ufr.edu.br", "Deve ser um e-mail @ufr.edu.br"),
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { newEmail } = requestEmailChangeSchema.parse(body);

    if (newEmail === session.user.email) {
      throw new Error(APP_ERRORS.USER_SAME_EMAIL.message);
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      throw new Error(APP_ERRORS.USER_EMAIL_IN_USE.message);
    }

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP
    await prisma.otpCode.create({
      data: {
        email: newEmail, // Send to the NEW email
        codeHash,
        expiresAt,
      },
    });

    // Send OTP to NEW email
    await sendOtpEmail(newEmail, code);

    return NextResponse.json({ message: "Código enviado para o novo e-mail" });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  getAuthSession,
  handleApiError,
  unauthorizedResponse,
} from "@/lib/api-utils";
import { APP_ERRORS } from "@/lib/errors";

const verifyEmailChangeSchema = z.object({
  newEmail: z.string().email(),
  code: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { newEmail, code } = verifyEmailChangeSchema.parse(body);

    const otp = await prisma.otpCode.findFirst({
      where: {
        email: newEmail,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { sentAt: "desc" },
    });

    if (!otp) {
      throw new Error(APP_ERRORS.AUTH_INVALID_CODE.message);
    }

    const isValid = await bcrypt.compare(code, otp.codeHash);

    if (!isValid) {
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new Error(APP_ERRORS.AUTH_INCORRECT_CODE.message);
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    // Update user email
    await prisma.user.update({
      where: { email: session.user.email! },
      data: { email: newEmail },
    });

    // Also update Proponent email if exists to keep them in sync?
    // The requirement didn't explicitly say, but usually good practice.
    // However, let's stick to the user update for now as per previous implementation.

    return NextResponse.json({ message: "E-mail atualizado com sucesso" });
  } catch (error) {
    return handleApiError(error);
  }
}

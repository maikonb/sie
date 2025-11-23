import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { APP_ERRORS } from "@/lib/errors";

export async function getAuthSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  return session;
}

export function handleApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (
    error instanceof Error &&
    Object.values(APP_ERRORS).some((e) => e.message === error.message)
  ) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.error("API Error:", error);
  return NextResponse.json(
    { error: APP_ERRORS.GENERIC_ERROR.message },
    { status: 500 }
  );
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: APP_ERRORS.AUTH_UNAUTHORIZED.message },
    { status: 401 }
  );
}

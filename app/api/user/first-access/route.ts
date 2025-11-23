import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { storageService } from "@/lib/storage";

import { APP_ERRORS } from "@/lib/errors";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: APP_ERRORS.AUTH_UNAUTHORIZED.code }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const username = formData.get("username") as string;
    const image = formData.get("image") as File | null;

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: APP_ERRORS.USER_INVALID_NAME.code }, { status: 400 });
    }

    let imageUrl: string | undefined;

    if (image && image.size > 0) {
      // Validate image type/size if needed
      if (!image.type.startsWith("image/")) {
         return NextResponse.json({ error: "Arquivo deve ser uma imagem." }, { status: 400 });
      }
      
      imageUrl = await storageService.uploadFile(image, "profile-images");
    }

    // Update User
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: username,
        image: imageUrl, // Update image if exists
        firstAccess: false,
      },
    });

    // Update Proponent (if exists)
    await prisma.proponent.update({
      where: { email: session.user.email },
      data: {
        name: username,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating first access:", error);
    return NextResponse.json({ error: APP_ERRORS.USER_UPDATE_FAILED.code }, { status: 500 });
  }
}

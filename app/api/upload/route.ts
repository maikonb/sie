import { NextResponse } from "next/server";
import { storageService } from "@/lib/storage";
import {
  getAuthSession,
  handleApiError,
  unauthorizedResponse,
} from "@/lib/api-utils";
import { APP_ERRORS } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return unauthorizedResponse();
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error(APP_ERRORS.UPLOAD_NO_FILE.message);
    }

    // Validate file type and size if needed
    if (!file.type.startsWith("image/")) {
      throw new Error(APP_ERRORS.UPLOAD_INVALID_TYPE.message);
    }

    const path = `users/${session.user.id}/avatar`;
    const url = await storageService.uploadFile(file, path);

    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error);
  }
}

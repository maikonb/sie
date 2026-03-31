import { NextRequest, NextResponse } from "next/server"
import { fileService } from "@/lib/services/file"
import { Readable } from "stream"
import { handleApiError } from "@/lib/api-utils"

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    const key = path.join("/")

    if (!key) {
      return new NextResponse(null, { status: 404 })
    }

    const fileStream = await fileService.getFileStream(key)

    if (!fileStream.Body) {
      return new NextResponse(null, { status: 404 })
    }

    const stream = fileStream.Body as Readable

    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk))
        stream.on("end", () => controller.close())
        stream.on("error", (err) => controller.error(err))
      },
    })

    const headers = new Headers()
    if (fileStream.ContentType) {
      headers.set("Content-Type", fileStream.ContentType)
    }
    if (fileStream.ContentLength) {
      headers.set("Content-Length", fileStream.ContentLength.toString())
    }
    if (fileStream.ETag) {
      headers.set("ETag", fileStream.ETag)
    }
    headers.set("Cache-Control", "public, max-age=31536000, immutable")

    return new NextResponse(webStream, {
      headers,
      status: 200,
    })
  } catch (error: unknown) {
    console.error("Error serving file:", error)
    if (typeof error === "object" && error !== null && "name" in error && (error as { name?: unknown }).name === "NoSuchKey") {
      return new NextResponse(null, { status: 404 })
    }
    return handleApiError(error)
  }
}

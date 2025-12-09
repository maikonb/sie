import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import prisma from "@/lib/config/db"
import { v4 as uuidv4 } from "uuid"

class FileService {
  private client: S3Client
  private bucket: string
  private isDev: boolean

  constructor() {
    this.bucket = process.env.AWS_BUCKET_NAME || "sie-bucket"
    this.isDev = process.env.NODE_ENV !== "production"

    this.client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      endpoint: process.env.AWS_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
      forcePathStyle: this.isDev,
    })
  }

  async generatePresignedUrl(filename: string, contentType: string, folder: string = "uploads"): Promise<{ url: string; key: string; fileId: string }> {
    const fileId = uuidv4()
    const extension = filename.split(".").pop()
    const key = `${folder}/${fileId}.${extension}`

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ACL: "public-read",
      Metadata: {
        "original-name": filename,
      },
    })

    const signedUrl = await getSignedUrl(this.client, command, { expiresIn: 3600 })

    return { url: signedUrl, key, fileId }
  }

  async uploadFile(content: Buffer | string, filename: string, contentType: string, folder: string = "generated"): Promise<any> {
    const fileId = uuidv4()
    const extension = filename.split(".").pop()
    const key = `${folder}/${fileId}.${extension}`

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: content,
      ContentType: contentType,
      ACL: "public-read",
      Metadata: {
        "original-name": filename,
      },
    })

    await this.client.send(command)

    const url = this.getPublicUrl(key)

    return await prisma.file.create({
      data: {
        id: fileId,
        key,
        url,
        bucket: this.bucket,
        filename,
        contentType,
        size: content.length,
      },
    })
  }

  async createFileFromS3(key: string): Promise<any> {
    const existingFile = await prisma.file.findFirst({
      where: { key },
    })

    if (existingFile) {
      return existingFile
    }

    try {
      const head = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      )

      const filename = head.Metadata?.["original-name"] || key.split("/").pop() || "unknown"

      const basename = key.split("/").pop() || ""
      const fileId = basename.split(".")[0] || uuidv4()

      const url = this.getPublicUrl(key)

      return await prisma.file.create({
        data: {
          id: fileId,
          key,
          url,
          bucket: this.bucket,
          filename,
          contentType: head.ContentType || "application/octet-stream",
          size: head.ContentLength || 0,
        },
      })
    } catch (error) {
      console.error("Error verifying S3 file:", error)
      throw new Error("File not found in S3 or invalid")
    }
  }

  async deleteFile(fileId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    })

    if (!file) return

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: file.key,
    })

    await this.client.send(command)

    await prisma.file.delete({
      where: { id: fileId },
    })
  }

  async getFileStream(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    return await this.client.send(command)
  }

  getPublicUrl(key: string) {
    return `/api/files/${key}`
  }
}

export const fileService = new FileService()

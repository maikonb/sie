import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

class StorageService {
  private client: S3Client
  private bucket: string

  constructor() {
    this.bucket = process.env.AWS_BUCKET_NAME || "sie-bucket"

    this.client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      endpoint: process.env.AWS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
      },
      forcePathStyle: process.env.NODE_ENV !== "production", // Needed for LocalStack
    })
  }

  async uploadFile(file: File, path: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer())
    const key = `${path}/${Date.now()}-${file.name}`

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    })

    await this.client.send(command)

    const endpoint = process.env.AWS_ENDPOINT || `https://s3.${process.env.AWS_REGION}.amazonaws.com`
    const cleanEndpoint = endpoint.replace(/\/$/, "")

    return `${cleanEndpoint}/${this.bucket}/${key}`
  }
}

export const storageService = new StorageService()

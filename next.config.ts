import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "production") {
      const bucketName = process.env.AWS_BUCKET_NAME || "sie-bucket"
      return [
        {
          source: "/uploads/:path*",
          destination: `http://localhost:4566/${bucketName}/:path*`, // Proxy to LocalStack S3
        },
      ]
    }

    return []
  },
}

export default nextConfig

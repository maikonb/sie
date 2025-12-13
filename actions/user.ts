"use server"

import prisma from "@/lib/config/db"
import { getAuthSession } from "@/lib/api-utils"
import { fileService } from "@/lib/services/file"
import { APP_ERRORS } from "@/lib/errors"

export async function updateFirstAccess(data: { username: string; imageKey?: string }) {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  let fileRecord = null
  if (data.imageKey) {
    fileRecord = await fileService.createFileFromS3(data.imageKey)
  }

  const updateData: any = {
    name: data.username,
    firstAccess: false,
  }

  if (fileRecord) {
    updateData.imageId = fileRecord.id
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    // Also update or create Proponent record
    await prisma.proponent.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating user first access:", error)
    throw new Error(APP_ERRORS.GENERIC_ERROR.code)
  }
}

export async function updateUser(data: { name: string; imageKey?: string; imageId?: string }) {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { imageId: true },
  })

  let fileRecord = null
  const keyToUse = data.imageKey || data.imageId

  if (keyToUse) {
    try {
      fileRecord = await fileService.createFileFromS3(keyToUse)
    } catch (error) {
      console.error("Failed to create file from S3:", error)
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      imageId: fileRecord?.id,
    },
  })

  if (fileRecord && currentUser?.imageId && currentUser.imageId !== fileRecord.id) {
    await fileService.deleteFile(currentUser.imageId)
  }

  return { success: true, user: updatedUser }
}

import { sendOtpEmail } from "@/lib/services/email"
import bcrypt from "bcryptjs"

export async function requestEmailChange(newEmail: string) {
  const session = await getAuthSession()
  if (!session?.user?.email) throw new Error("Unauthorized")

  if (newEmail === session.user.email) {
    return { success: false, error: APP_ERRORS.USER_SAME_EMAIL.message }
  }

  const existingUser = await prisma.user.findUnique({ where: { email: newEmail } })
  if (existingUser) {
    return { success: false, error: APP_ERRORS.USER_EMAIL_IN_USE.message }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await prisma.otpCode.create({
    data: {
      email: newEmail,
      codeHash,
      expiresAt,
    },
  })

  await sendOtpEmail(newEmail, code)
  return { success: true }
}

export async function verifyEmailChange(newEmail: string, code: string) {
  const session = await getAuthSession()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const otp = await prisma.otpCode.findFirst({
    where: {
      email: newEmail,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { sentAt: "desc" },
  })

  if (!otp) return { success: false, error: APP_ERRORS.AUTH_INVALID_CODE.message }

  const isValid = await bcrypt.compare(code, otp.codeHash)

  if (!isValid) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    })
    return { success: false, error: APP_ERRORS.AUTH_INCORRECT_CODE.message }
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  })

  await prisma.user.update({
    where: { email: session.user.email },
    data: { email: newEmail },
  })

  return { success: true }
}

export async function requestOtp(email: string) {
  const clean = (email ?? "").toLowerCase().trim()
  if (!clean.endsWith("@ufr.edu.br")) {
    return { success: false, error: APP_ERRORS.AUTH_INVALID_DOMAIN.code }
  }

  const lastOtp = await prisma.otpCode.findFirst({
    where: {
      email: clean,
      sentAt: { gt: new Date(Date.now() - 25 * 1000) },
    },
  })

  if (lastOtp) {
    return { success: false, error: APP_ERRORS.AUTH_TOO_MANY_REQUESTS.code }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.otpCode.create({
    data: { email: clean, codeHash, expiresAt },
  })

  await sendOtpEmail(clean, code)
  return { success: true }
}

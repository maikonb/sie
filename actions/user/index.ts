"use server"

import prisma from "@/lib/config/db"
import { getAuthSession } from "@/lib/api-utils"
import { fileService } from "@/lib/services/file"
import { APP_ERRORS } from "@/lib/errors"
import { sendOtpEmail } from "@/lib/services/email"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import {
  userValidator,
  UpdateFirstAccessResponse,
  UpdateUserResponse,
  RequestEmailChangeResponse,
  VerifyEmailChangeResponse,
  RequestOtpResponse,
} from "./types"

export async function updateFirstAccess(data: { username: string; imageKey?: string }): Promise<UpdateFirstAccessResponse> {
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  let fileRecord = null
  if (data.imageKey) {
    fileRecord = await fileService.createFileFromS3(data.imageKey)
  }

  const updateData: Prisma.UserUpdateInput = {
    name: data.username,
    firstAccess: false,
  }

  if (fileRecord) {
    updateData.imageFile = { connect: { id: fileRecord.id } }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating user first access:", error)
    throw new Error(APP_ERRORS.GENERIC_ERROR.code)
  }
}

export async function updateUser(data: {
  name: string
  imageKey?: string
  imageId?: string
  color?: string
}): Promise<UpdateUserResponse> {
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
      color: data.color,
    },
    ...userValidator,
  })

  if (fileRecord && currentUser?.imageId && currentUser.imageId !== fileRecord.id) {
    await fileService.deleteFile(currentUser.imageId)
  }

  return { success: true, user: updatedUser }
}

export async function requestEmailChange(newEmail: string): Promise<RequestEmailChangeResponse> {
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

export async function verifyEmailChange(newEmail: string, code: string): Promise<VerifyEmailChangeResponse> {
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

export async function requestOtp(email: string): Promise<RequestOtpResponse> {
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

import { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { compare } from "bcryptjs"
import { APP_ERRORS } from "@/lib/errors"

const ALLOWED_DOMAINS =
  process.env.ALLOWED_EMAIL_DOMAINS?.toLowerCase()
    .split(",")
    .map((d) => d.trim()) ?? []

function isUfr(email?: string | null) {
  if (!email) return false

  const domain = email.substring(email.indexOf("@") + 1).toLowerCase()

  if (ALLOWED_DOMAINS.length > 0) {
    return ALLOWED_DOMAINS.includes(domain)
  }

  return domain === "ufr.edu.br"
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Login por CÓDIGO (OTP) via Credentials: { email, code }
    Credentials({
      name: "Email + Código",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Código", type: "text" },
      },
      authorize: async (creds) => {
        const email = creds?.email?.toLowerCase().trim()
        const code = creds?.code?.trim()

        if (!email || !code || !isUfr(email)) {
          throw new Error(APP_ERRORS.AUTH_INVALID_DOMAIN.code)
        }

        // busca OTP válido
        const otp = await prisma.otpCode.findFirst({
          where: {
            email,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { sentAt: "desc" }, // pega o último
        })

        if (!otp) {
          throw new Error(APP_ERRORS.AUTH_INVALID_CODE.code)
        }

        const ok = await compare(code, otp.codeHash)
        if (!ok) {
          // opcional: incrementa tentativas
          await prisma.otpCode.update({
            where: { id: otp.id },
            data: { attempts: { increment: 1 } },
          })
          throw new Error(APP_ERRORS.AUTH_INCORRECT_CODE.code)
        }

        // marca como usado
        await prisma.otpCode.update({
          where: { id: otp.id },
          data: { usedAt: new Date() },
        })

        // encontra ou cria o usuário
        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          // Generate random color
          const colors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500"]
          const randomColor = colors[Math.floor(Math.random() * colors.length)]

          user = await prisma.user.create({
            data: {
              email,
              emailVerified: new Date(), // verifica email no cadastro via OTP
              firstAccess: true,
              color: randomColor,
            },
          })
        } else {
          // Se já existe, atualiza emailVerified se ainda não estiver
          if (!user.emailVerified) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() },
            })
          }
        }

        // garante  vinculado (1-1 por e-mail)
        const exists = await prisma.proponent.findFirst({ where: { email } })
        if (!exists) {
          await prisma.proponent.create({
            data: { name: email.split("@")[0], email },
          })
        }

        return {
          id: user.id,
          name: user.name || undefined,
          email: user.email,
          image: user.image,
          firstAccess: user.firstAccess,
          color: user.color || undefined,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ account, profile, user }) {
      console.log("signin", "account: ", account, "profile: ", profile, "user: ", user)

      const email = profile?.email ?? user?.email

      if (!email) return false

      // Restringe a @ufr.edu.br
      if (!isUfr(email)) return false

      await prisma.proponent.upsert({
        where: { email },
        update: {
          userId: user.id,
        },
        create: {
          email,
          name: email.split("@")[0],
          userId: user.id,
        },
      })

      return true
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.uid = user.id
        token.firstAccess = user.firstAccess
        token.color = user.color
        token.name = user.name
        token.picture = user.image
      }

      if (trigger === "update" && token.uid) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.uid },
        })
        if (freshUser) {
          token.firstAccess = freshUser.firstAccess
          token.color = freshUser.color || undefined
          token.name = freshUser.name || undefined
          token.picture = freshUser.image || undefined
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid
        session.user.firstAccess = token.firstAccess as boolean
        session.user.color = token.color || undefined
        session.user.name = token.name
        session.user.image = token.picture
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(`${baseUrl}/conta/primeiro-acesso`)) return url
      return `${baseUrl}/projetos/`
    },
  },

  pages: {
    // signIn: "/entrar",
    // verifyRequest: "/verificar-email",
    // error: "/erro-auth",
    newUser: "/conta/primeiro-acesso",
    signIn: "/auth/login",
  },
}

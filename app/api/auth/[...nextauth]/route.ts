import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

// helper: restringe domínio
function isUfr(email?: string | null) {
  return !!email && email.toLowerCase().endsWith("@ufr.edu.br");
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
        const email = creds?.email?.toLowerCase().trim();
        const code = creds?.code?.trim();

        if (!email || !code || !isUfr(email)) return null;

        // busca OTP válido
        const otp = await prisma.otpCode.findFirst({
          where: {
            email,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { sentAt: "desc" }, // pega o último
        });
        if (!otp) return null;

        const ok = await compare(code, otp.codeHash);
        if (!ok) {
          // opcional: incrementa tentativas
          await prisma.otpCode.update({
            where: { id: otp.id },
            data: { attempts: { increment: 1 } },
          });
          return null;
        }

        // marca como usado
        await prisma.otpCode.update({
          where: { id: otp.id },
          data: { usedAt: new Date() },
        });

        // encontra ou cria o usuário
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({ data: { email } });
        }

        // garante Proponente vinculado (1-1 por e-mail)
        const exists = await prisma.proponente.findFirst({ where: { email } });
        if (!exists) {
          await prisma.proponente.create({
            data: { nome: email.split("@")[0], email },
          });
        }

        return user; // sucesso => NextAuth cria JWT
      },
    }),
  ],

  callbacks: {
    async signIn({ account, profile, user }) {

      console.log("signin", 'account: ', account, 'profile: ', profile, 'user: ', user);

      const email = profile?.email ?? user?.email;

      if (!email)
        return false;

      // Restringe a @ufr.edu.br
      if (!isUfr(email)) 
        return false;

      await prisma.proponente.upsert({
        where: { email }, 
        update: {
          userId: user.id,
        },
        create: {
          email,
          nome: email.split("@")[0],
          userId: user.id,
        },
      });

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id; 
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid; 
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(`${baseUrl}/projetos/primeiro-acesso`)) return url;
      return `${baseUrl}/projetos/`;
    },    
  },

  pages: {
    // signIn: "/entrar",
    // verifyRequest: "/verificar-email",
    // error: "/erro-auth",
    newUser: "/projetos/primeiro-acesso", 
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

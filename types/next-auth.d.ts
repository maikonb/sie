// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstAccess: boolean;
    } & DefaultSession["user"]; 
  }
  interface User {
    firstAccess: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    firstAccess?: boolean;
  }
}

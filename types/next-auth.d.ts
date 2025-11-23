// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstAccess: boolean;
      color?: string;
      name?: string;
    } & DefaultSession["user"]; 
  }
  interface User {
    firstAccess: boolean;
    color?: string;
    name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    firstAccess?: boolean;
    color?: string;
    name?: string;
  }
}

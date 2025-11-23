"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "../ui/sonner";
import { SingleTabProvider } from "./single-tab-provider";
import { SingleTabGuard } from "./single-tab-guard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SingleTabProvider>
        <SingleTabGuard>{children}</SingleTabGuard>
      </SingleTabProvider>
      <Toaster />
    </SessionProvider>
  );
}

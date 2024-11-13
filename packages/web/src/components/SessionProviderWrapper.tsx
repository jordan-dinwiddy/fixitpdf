"use client"; // This is essential for client components

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderWrapperProps {
  children: ReactNode;
}

export default function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
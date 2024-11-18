import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "FixItPDF",
  description: "Fix your PDFs here!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <Toaster />
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

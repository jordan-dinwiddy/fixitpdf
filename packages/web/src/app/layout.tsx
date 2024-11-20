import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import Script from 'next/script';
import "./globals.css";

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
      <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YM1R5MQ5C9" // FixItPDF Tag
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YM1R5MQ5C9');
          `}
        </Script>
        <SessionProviderWrapper>
          <Toaster />
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

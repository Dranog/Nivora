// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthSync } from "@/components/auth/AuthSync";
import { RouteShell } from "@/components/layout/RouteShell";
import { Providers } from "./providers";
import { ToasterProvider } from "@/components/ui/use-toast";
import { Toaster } from "sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OLIVER - App Shell F1",
  description: "Modern OnlyFans-like platform with Next.js 15 and Turquoise Design System",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ✅ Charger les messages i18n côté serveur
  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AuthSync />
            <Providers>
              <ToasterProvider>
                <RouteShell>{children}</RouteShell>
              </ToasterProvider>
            </Providers>
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

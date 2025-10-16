import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/theme-provider.tsx";
// import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital ID Card System",
  description:
    "A comprehensive digital ID card management system for citizens, stations, and administrators",
  keywords:
    "digital id, id card, citizen registration, station management, digital identity, ethiopia, ዲጂታል መለያ, ዜጋ ምዝገባ, ጣቢያ አስተዳደር",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased select-none fixed inset-0 grid`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <div className="h-dvh bg-gradient-to-br from-primary-200 to-secondary-200 text-foreground grid overflow-hidden">
              {children}
              <Toaster />
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

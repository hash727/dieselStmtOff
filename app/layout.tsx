import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { OfficeProvider } from "@/context/OfficeContext";
import { auth } from "@/auth";
import { GlobalNavbar } from "@/components/nav/global-navbar";
import { GlobalFooter } from "@/components/nav/global-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDOP, BLY",
  description: "Sub-Divisional Engineer, Bellary URBAN, office of GMTD, BSNL, Bellary",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const initialId = session?.user?.activeOfficeId || "";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="flex flex-col min-h-screen bg-white dark:bg-zinc-950"
      >
        <SessionProvider>
          <ThemeProvider
            attribute={'class'}
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-0 z-50 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 text-center">
                DEVELOPMENT MODE - USING PORT 3001
              </div>
            )}
            <GlobalNavbar />
            <main className="flex-1">
            <OfficeProvider initialOfficeId={initialId}>
              {children}
            </OfficeProvider>
            <Toaster />
            </main>
            <GlobalFooter />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

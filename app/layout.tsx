/**
 * Root Layout - NextStep Platform
 * 
 * Main layout wrapper for the entire application
 * Includes global Header, Footer, and authentication/data providers
 */

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/landing/Footer";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "NextStep",
  description: "Connect youth with job opportunities and mentors to advance their careers",
  icons: {
    icon: "/assets/icon.svg",
    apple: "/assets/icon.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${playfairDisplay.variable}`} suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="min-h-screen bg-background">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

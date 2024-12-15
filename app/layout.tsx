import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import RootProviders from "@/components/providers/RootProviders";
import { Inter } from "next/font/google"; 
import {Toaster} from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Biy daalt Odontuya & Erdenesuren",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark"
      style={{
        colorScheme: "dark"
      }}>
        <body className={inter.className}>
          <Toaster richColors position="bottom-right"/>
          <RootProviders>{children}</RootProviders>
          </body>
        
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBarWrapper from "@/components/NavBarWrapper";
import UsernameRedirector from "@/components/UsernameRedirector";
import AppInitializer from "@/components/AppInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MPACC Games",
  description: "Games for MPACC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-y-auto">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <AppInitializer />
        <UsernameRedirector />
        <NavBarWrapper />
        {children}
      </body>
    </html>
  );
}

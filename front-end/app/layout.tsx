import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "./components/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeCare AI - Software Upgrade Assistant",
  description: "AI-powered tool for managing and upgrading software dependencies across repositories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <Navigation />

          <main className="flex-1">
            {children}
          </main>

          <footer className="bg-[#2C1810] text-white py-4 text-center">
            <p>&copy; {new Date().getFullYear()} CodeCare AI. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

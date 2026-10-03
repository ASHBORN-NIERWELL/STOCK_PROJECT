import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CSE Mastery — Colombo Stock Exchange Trader Simulator & AI Mentor",
  description: "Learn stock trading on the Colombo Stock Exchange (CSE), Sri Lanka. Live/delayed market data, interactive labs, realistic mock trading ledger, and an unvarnished AI coach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col`}>
        {children}
      </body>
    </html>
  );
}

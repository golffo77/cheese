import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Käsetheke Digital",
  description: "Interaktive Online-Käsetheke mit KI-Erkennung und Live-Beratung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}

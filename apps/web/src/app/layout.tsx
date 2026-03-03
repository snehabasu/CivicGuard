import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CareNotes — Clinical Documentation Assistant",
  description:
    "AI-assisted scribe tool for social workers. All AI output is DRAFT pending clinician review.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-surface text-teal-dark min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

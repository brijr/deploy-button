import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Vercel Deploy Button Generator | Github Link to Vercel Deploy Button",
  description:
    "Generate a Vercel Deploy Button from a Github repository link. Created by Bridger Tower.",
  metadataBase: new URL("https://deploy.bridger.to"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-scrollbar">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <main className="flex items-center justify-center py-12">
          {children}
        </main>
      </body>
    </html>
  );
}

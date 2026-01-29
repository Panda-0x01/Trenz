import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Trenz - Trend-Based Social Media",
  description: "Join trending competitions, share your creativity, and climb the leaderboards on Trenz.",
  keywords: ["social media", "trends", "competition", "leaderboard", "photography"],
  icons: {
    icon: [
      { url: "/i1.jpeg", type: "image/jpeg" },
      { url: "/i1.jpeg", sizes: "32x32", type: "image/jpeg" },
    ],
    shortcut: "/i1.jpeg",
    apple: "/i1.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/i1.jpeg" type="image/jpeg" />
        <link rel="shortcut icon" href="/i1.jpeg" />
        <link rel="apple-touch-icon" href="/i1.jpeg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

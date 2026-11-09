import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TokTrend Flow — Analisis Produk Trending TikTok & AI Flow Studio",
  description:
    "Platform riset produk laris TikTok Shop, bedah video kreator affiliate, rekomendasi hashtag, dan generator prompt video Google Flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`dark ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#090A0F] text-[#F3F4F6] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

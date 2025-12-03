import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flavor Archive - AI 맞춤 식단 추천",
  description: "건강 정보를 입력하면 AI가 맞춤 식단을 추천해드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}

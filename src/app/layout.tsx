import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CoupangBanner from "@/components/CoupangBanner";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CatsIndex — 고양이 사료·모래 최저가 트래커",
  description: "매일 업데이트되는 고양이 사료와 모래 최저가를 확인하고 AI 추천을 받아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <CoupangBanner />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-100 bg-white">
          © 2025 CatsIndex · 가격은 매일 새벽 자동 업데이트됩니다 · 쿠팡 파트너스 활동으로 수수료를 받을 수 있습니다
        </footer>
      </body>
    </html>
  );
}

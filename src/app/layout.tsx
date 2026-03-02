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
  title: "CryptoExchange Finder | 仮想通貨取引所 比較・検索",
  description:
    "国内・海外の仮想通貨取引所を手数料・対応銘柄・機能で比較・検索できるサービスです。取引コストシミュレーターで実際のコストを試算できます。",
  keywords: ["仮想通貨", "取引所", "比較", "手数料", "ビットコイン", "暗号資産"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

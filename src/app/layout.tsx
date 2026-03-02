import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "暗号通貨取引所ガイド | 国内・海外取引所を比較",
  description:
    "国内・海外の仮想通貨取引所を手数料・対応銘柄・機能で比較・検索できるサービスです。取引コストシミュレーターで実際のコストを試算できます。",
  keywords: ["仮想通貨", "取引所", "比較", "手数料", "ビットコイン", "暗号資産", "DEX", "海外取引所"],
  metadataBase: new URL("https://cryptoinfo.jp"),
  other: {
    "impact-site-verification": "e2f19bad-6a82-47a0-b8b6-fa4c1d280944",
  },
  openGraph: {
    title: "暗号通貨取引所ガイド | 国内・海外取引所を比較",
    description: "国内・海外の仮想通貨取引所を手数料・対応銘柄・機能で比較・検索できるサービスです。",
    url: "https://cryptoinfo.jp",
    siteName: "暗号通貨取引所ガイド",
    locale: "ja_JP",
    type: "website",
  },
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3863420869587706"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}

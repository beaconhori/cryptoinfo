"use client";

import { useEffect } from "react";
import { Wallet, WalletType, SecurityLevel, WalletChain, WalletFeature } from "@/types/wallet";
import Fa from "@/components/Fa";

const TYPE_CONFIG: Record<WalletType, { label: string; icon: string; color: string; bg: string }> = {
  software:          { label: "デスクトップ", icon: "desktop",   color: "#3B82F6", bg: "#DBEAFE" },
  hardware:          { label: "ハードウェア", icon: "microchip", color: "#D97706", bg: "#FEF3C7" },
  browser_extension: { label: "ブラウザ拡張", icon: "browser",   color: "#7C3AED", bg: "#EDE9FE" },
  mobile:            { label: "モバイル",     icon: "mobile",    color: "#059669", bg: "#D1FAE5" },
};

const SECURITY_CONFIG: Record<SecurityLevel, { label: string; color: string; bg: string; desc: string }> = {
  high:   { label: "高",   color: "#059669", bg: "#D1FAE5", desc: "非常に安全な設計。自己管理型で高いセキュリティを誇ります。" },
  medium: { label: "中",   color: "#D97706", bg: "#FEF3C7", desc: "一般的なセキュリティレベル。適切に管理すれば十分安全です。" },
  low:    { label: "低",   color: "#DC2626", bg: "#FEE2E2", desc: "利便性優先の設計。大きな資産の管理には注意が必要です。" },
};

const CHAIN_LABELS: Record<WalletChain, string> = {
  EVM:    "Ethereum / EVM互換",
  BTC:    "Bitcoin",
  SOL:    "Solana",
  COSMOS: "Cosmos",
  SUI:    "Sui",
  APTOS:  "Aptos",
  NEAR:   "NEAR Protocol",
  TRON:   "TRON",
};

const FEATURE_CONFIG: Partial<Record<WalletFeature, { label: string; icon: string; desc: string }>> = {
  dex_swap:         { label: "DEXスワップ",         icon: "arrows-rotate",        desc: "分散型取引所でのトークンスワップに対応" },
  nft:              { label: "NFT管理",              icon: "image",                desc: "NFTの表示・送受信・管理が可能" },
  staking:          { label: "ステーキング",          icon: "coins",                desc: "トークンのステーキングに対応" },
  hardware_connect: { label: "ハードウェア連携",       icon: "microchip",            desc: "ハードウェアウォレットと接続可能" },
  ledger_support:   { label: "Ledger対応",           icon: "microchip",            desc: "Ledgerハードウェアウォレットと連携可能" },
  trezor_support:   { label: "Trezor対応",           icon: "microchip",            desc: "Trezorハードウェアウォレットと連携可能" },
  multi_account:    { label: "マルチアカウント",       icon: "layer-group",          desc: "複数のウォレットアドレスを管理可能" },
  browser_ext:      { label: "ブラウザ拡張",          icon: "browser",              desc: "ブラウザ拡張機能として使用可能" },
  mobile_app:       { label: "モバイルアプリ",        icon: "mobile",               desc: "iOS / Androidアプリを提供" },
  web_app:          { label: "Webアプリ",            icon: "globe",                desc: "ブラウザから直接アクセス可能" },
  open_source:      { label: "オープンソース",         icon: "code",                 desc: "ソースコードが公開されており透明性が高い" },
  wc2:              { label: "WalletConnect v2",    icon: "link",                 desc: "WalletConnect v2に対応。DAppsと接続可能" },
  passkey:          { label: "パスキー / 生体認証",   icon: "fingerprint",          desc: "生体認証やパスキーでのログインに対応" },
  social_recovery:  { label: "ソーシャルリカバリー",   icon: "people-group",         desc: "信頼できる人を介したウォレット復元が可能" },
  watch_only:       { label: "ウォッチオンリー",       icon: "eye",                  desc: "秘密鍵不要でアドレスの残高・取引を監視可能" },
};

function scoreColor(score: number): string {
  if (score >= 8.5) return "#10B981";
  if (score >= 7.0) return "#3B82F6";
  if (score >= 5.5) return "#F59E0B";
  return "#EF4444";
}

interface WalletModalProps {
  wallet: Wallet;
  onClose: () => void;
}

export default function WalletModal({ wallet, onClose }: WalletModalProps) {
  const typeConfig = TYPE_CONFIG[wallet.type];
  const secConfig = SECURITY_CONFIG[wallet.securityLevel];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* ヘッダー */}
        <div
          className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100"
          style={{ background: `linear-gradient(135deg, ${wallet.logoColor}18 0%, white 60%)` }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md flex-shrink-0"
            style={{ backgroundColor: wallet.logoColor }}
          >
            {wallet.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{wallet.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: typeConfig.color, backgroundColor: typeConfig.bg }}
              >
                <Fa icon={typeConfig.icon} variant="light" size={10} className="mr-1" />
                {typeConfig.label}
              </span>
              {wallet.japaneseSupport && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                  🇯🇵 日本語対応
                </span>
              )}
              {wallet.isFree && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                  無料
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Fa icon="xmark" size={14} className="text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 説明 */}
          <p className="text-sm text-gray-600 leading-relaxed">{wallet.description}</p>

          {/* スコア＆セキュリティ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 p-3.5 text-center">
              <p className="text-xs text-gray-400 mb-1">信頼スコア</p>
              <p className="text-3xl font-black" style={{ color: scoreColor(wallet.trustScore) }}>
                {wallet.trustScore.toFixed(1)}
              </p>
              <p className="text-xs text-gray-400">/ 10</p>
            </div>
            <div className="rounded-2xl p-3.5 text-center" style={{ backgroundColor: secConfig.bg }}>
              <p className="text-xs mb-1" style={{ color: secConfig.color }}>セキュリティ</p>
              <p className="text-2xl font-black" style={{ color: secConfig.color }}>{secConfig.label}</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: secConfig.color }}>
                {secConfig.desc.split("。")[0]}
              </p>
            </div>
          </div>

          {/* 対応チェーン */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100 bg-gray-50">
              <Fa icon="link" variant="light" size={13} className="text-gray-500" />
              <h4 className="font-semibold text-gray-800 text-sm">対応ブロックチェーン</h4>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {wallet.chains.map((chain) => (
                <span
                  key={chain}
                  className="px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-semibold text-gray-700"
                >
                  {CHAIN_LABELS[chain] ?? chain}
                </span>
              ))}
            </div>
          </div>

          {/* 機能一覧 */}
          {wallet.features.length > 0 && (
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100 bg-gray-50">
                <Fa icon="star" variant="light" size={13} className="text-gray-500" />
                <h4 className="font-semibold text-gray-800 text-sm">主な機能</h4>
              </div>
              <div className="p-4 grid grid-cols-1 gap-2">
                {wallet.features.map((f) => {
                  const cfg = FEATURE_CONFIG[f];
                  if (!cfg) return null;
                  return (
                    <div key={f} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Fa icon={cfg.icon} variant="light" size={11} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{cfg.label}</p>
                        <p className="text-[11px] text-gray-400">{cfg.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 設立年 / 価格 */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-2xl bg-gray-50 p-3 text-center">
              <p className="text-[11px] text-gray-400 mb-0.5">設立</p>
              <p className="text-sm font-bold text-gray-800">{wallet.established}年</p>
            </div>
            <div className="flex-1 rounded-2xl bg-gray-50 p-3 text-center">
              <p className="text-[11px] text-gray-400 mb-0.5">料金</p>
              <p className="text-sm font-bold text-gray-800">
                {wallet.isFree ? "無料" : wallet.priceNote ?? "有料"}
              </p>
            </div>
          </div>

          {/* 特記事項 */}
          {wallet.notes && (
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Fa icon="circle-info" size={13} className="text-amber-500" />
                <p className="text-xs font-semibold text-amber-700">メモ</p>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">{wallet.notes}</p>
            </div>
          )}

          {/* 公式サイトへのリンク */}
          <a
            href={wallet.affiliateUrl ?? wallet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-md"
            style={{ backgroundColor: wallet.logoColor }}
          >
            <Fa icon="arrow-up-right-from-square" size={13} />
            公式サイトへ
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Wallet, WalletType, SecurityLevel } from "@/types/wallet";
import Fa from "@/components/Fa";

const TYPE_CONFIG: Record<WalletType, { label: string; icon: string; bg: string; text: string }> = {
  software:          { label: "デスクトップ", icon: "desktop",     bg: "bg-blue-100",   text: "text-blue-700" },
  hardware:          { label: "ハードウェア", icon: "microchip",   bg: "bg-amber-100",  text: "text-amber-700" },
  browser_extension: { label: "ブラウザ拡張", icon: "browser",     bg: "bg-purple-100", text: "text-purple-700" },
  mobile:            { label: "モバイル",     icon: "mobile",      bg: "bg-green-100",  text: "text-green-700" },
};

const SECURITY_CONFIG: Record<SecurityLevel, { label: string; color: string }> = {
  high:   { label: "セキュリティ 高", color: "#10B981" },
  medium: { label: "セキュリティ 中", color: "#F59E0B" },
  low:    { label: "セキュリティ 低", color: "#EF4444" },
};

const CHAIN_LABELS: Record<string, string> = {
  EVM: "EVM",
  BTC: "BTC",
  SOL: "SOL",
  COSMOS: "Cosmos",
  SUI: "SUI",
  APTOS: "APT",
  NEAR: "NEAR",
  TRON: "TRX",
};

const FEATURE_LABELS: Record<string, { label: string; icon: string }> = {
  dex_swap:         { label: "DEX",       icon: "arrows-rotate" },
  nft:              { label: "NFT",        icon: "image" },
  staking:          { label: "Staking",    icon: "coins" },
  hardware_connect: { label: "HW連携",     icon: "microchip" },
  ledger_support:   { label: "Ledger",     icon: "microchip" },
  trezor_support:   { label: "Trezor",     icon: "microchip" },
  open_source:      { label: "OSS",        icon: "code" },
  wc2:              { label: "WC2",        icon: "link" },
  passkey:          { label: "Passkey",    icon: "fingerprint" },
  multi_account:    { label: "マルチ",     icon: "layer-group" },
};

function scoreColor(score: number): string {
  if (score >= 8.5) return "#10B981";
  if (score >= 7.0) return "#3B82F6";
  if (score >= 5.5) return "#F59E0B";
  return "#EF4444";
}

interface WalletCardProps {
  wallet: Wallet;
  onClick: () => void;
}

function WalletLogo({ wallet }: { wallet: Wallet }) {
  const localSrc = wallet.logoFile ? `/logos/${wallet.logoFile}` : null;
  const clearbitSrc = `https://logo.clearbit.com/${wallet.domain}`;
  const [src, setSrc] = useState<string | null>(localSrc ?? clearbitSrc);
  const [fallback, setFallback] = useState(false);

  const handleError = () => {
    if (src === localSrc) {
      setSrc(clearbitSrc);
    } else {
      setFallback(true);
    }
  };

  return (
    <div className="h-28 w-full relative overflow-hidden flex items-center justify-center bg-white">
      {!fallback && src ? (
        <img
          src={src}
          alt={`${wallet.name} logo`}
          onError={handleError}
          className="relative z-10 max-h-14 w-auto max-w-[180px] object-contain drop-shadow-sm"
        />
      ) : (
        <div
          className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
          style={{ backgroundColor: wallet.logoColor }}
        >
          {wallet.name.charAt(0)}
        </div>
      )}
    </div>
  );
}

export default function WalletCard({ wallet, onClick }: WalletCardProps) {
  const typeConfig = TYPE_CONFIG[wallet.type];
  const secConfig = SECURITY_CONFIG[wallet.securityLevel];

  const visibleFeatures = wallet.features
    .filter((f) => FEATURE_LABELS[f])
    .slice(0, 5);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200 group"
    >
      <WalletLogo wallet={wallet} />

      <div
        className="p-4"
        style={{ backgroundColor: `${wallet.logoColor}12` }}
      >
        {/* 名前 + タイプバッジ */}
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-bold text-gray-900 text-sm leading-snug pr-1.5 flex-1">
            {wallet.name}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${typeConfig.bg} ${typeConfig.text}`}>
            {typeConfig.label}
          </span>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {wallet.description}
        </p>

        {/* 対応チェーン */}
        <div className="flex flex-wrap gap-1 mb-3">
          {wallet.chains.map((chain) => (
            <span key={chain} className="text-[10px] font-semibold px-1.5 py-0.5 bg-white rounded text-gray-600">
              {CHAIN_LABELS[chain] ?? chain}
            </span>
          ))}
        </div>

        {/* 機能バッジ */}
        {visibleFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {visibleFeatures.map((f) => {
              const cfg = FEATURE_LABELS[f];
              return (
                <span key={f} className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 bg-white/70 rounded text-gray-500">
                  <Fa icon={cfg.icon} variant="light" size={9} />
                  {cfg.label}
                </span>
              );
            })}
          </div>
        )}

        {/* フッター */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: secConfig.color }}>
            {secConfig.label}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">スコア</span>
            <span className="text-sm font-black" style={{ color: scoreColor(wallet.trustScore) }}>
              {wallet.trustScore.toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-400">/ 10</span>
          </div>
        </div>
      </div>
    </div>
  );
}

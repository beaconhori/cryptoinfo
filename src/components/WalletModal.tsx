"use client";

import { useState } from "react";
import { Wallet, WalletType, SecurityLevel, WalletChain, WalletFeature } from "@/types/wallet";
import Fa from "@/components/Fa";

const TYPE_CONFIG: Record<WalletType, { label: string; icon: string; color: string; bg: string }> = {
  software:          { label: "デスクトップ",     icon: "desktop",             color: "#3B82F6", bg: "#DBEAFE" },
  hardware:          { label: "ハードウェア",     icon: "microchip",           color: "#D97706", bg: "#FEF3C7" },
  browser_extension: { label: "ブラウザ拡張",     icon: "browser",             color: "#7C3AED", bg: "#EDE9FE" },
  mobile:            { label: "モバイル",         icon: "mobile",              color: "#059669", bg: "#D1FAE5" },
  smart_account:     { label: "スマートウォレット", icon: "wand-magic-sparkles", color: "#E11D48", bg: "#FFE4E6" },
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
  dex_swap:         { label: "DEXスワップ",        icon: "arrows-rotate",       desc: "分散型取引所でのトークンスワップに対応" },
  nft:              { label: "NFT管理",             icon: "image",               desc: "NFTの表示・送受信・管理が可能" },
  staking:          { label: "ステーキング",         icon: "coins",               desc: "トークンのステーキングに対応" },
  hardware_connect: { label: "ハードウェア連携",      icon: "microchip",           desc: "ハードウェアウォレットと接続可能" },
  ledger_support:   { label: "Ledger対応",          icon: "microchip",           desc: "Ledgerハードウェアウォレットと連携可能" },
  trezor_support:   { label: "Trezor対応",          icon: "microchip",           desc: "Trezorハードウェアウォレットと連携可能" },
  multi_account:    { label: "マルチアカウント",      icon: "layer-group",         desc: "複数のウォレットアドレスを管理可能" },
  browser_ext:      { label: "ブラウザ拡張",         icon: "browser",             desc: "ブラウザ拡張機能として使用可能" },
  mobile_app:       { label: "モバイルアプリ",       icon: "mobile",              desc: "iOS / Androidアプリを提供" },
  web_app:          { label: "Webアプリ",           icon: "globe",               desc: "ブラウザから直接アクセス可能" },
  open_source:      { label: "オープンソース",        icon: "code",                desc: "ソースコードが公開されており透明性が高い" },
  wc2:              { label: "WalletConnect v2",   icon: "link",                desc: "WalletConnect v2に対応。DAppsと接続可能" },
  passkey:          { label: "パスキー / 生体認証",  icon: "fingerprint",         desc: "生体認証やパスキーでのログインに対応" },
  social_recovery:  { label: "ソーシャルリカバリー",  icon: "people-group",        desc: "信頼できる人を介したウォレット復元が可能" },
  watch_only:       { label: "ウォッチオンリー",      icon: "eye",                 desc: "秘密鍵不要でアドレスの残高・取引を監視可能" },
  gas_abstraction:  { label: "ガス代抽象化",         icon: "gas-pump",            desc: "ETH以外のトークンでガス代を支払い、またはガス代を無料化" },
  cross_chain:      { label: "クロスチェーン操作",    icon: "shuffle",             desc: "ブリッジ不要でチェーン間を自動的にまたいで操作可能" },
  multisig:         { label: "マルチシグ",           icon: "key",                 desc: "複数の署名が揃って初めて取引が承認される高セキュリティ方式" },
  erc4337:          { label: "ERC-4337",            icon: "wand-magic-sparkles", desc: "Ethereumのスマートアカウント標準規格に対応" },
  debit_card:       { label: "暗号資産デビットカード", icon: "credit-card",         desc: "暗号資産を使って実店舗・オンラインで決済可能なカード" },
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

/* ===== ロゴヘッダー（取引所モーダルと同パターン） ===== */
function ModalLogoHeader({ wallet, onClose }: { wallet: Wallet; onClose: () => void }) {
  const localSrc = wallet.logoFile ? `/logos/${wallet.logoFile}` : null;
  const clearbitSrc = `https://logo.clearbit.com/${wallet.domain}`;
  const [src, setSrc] = useState<string | null>(localSrc ?? clearbitSrc);
  const [fallback, setFallback] = useState(false);

  const handleError = () => {
    if (src === localSrc) setSrc(clearbitSrc);
    else setFallback(true);
  };

  const typeConfig = TYPE_CONFIG[wallet.type];

  return (
    <div
      className="rounded-t-2xl px-6 py-5 flex items-center justify-between flex-shrink-0"
      style={{ backgroundColor: `${wallet.logoColor}18` }}
    >
      <div className="flex items-center gap-4">
        {/* 白座布団ロゴ */}
        <div className="bg-white rounded-xl p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
          {!fallback && src ? (
            <img
              src={src}
              alt={wallet.name}
              onError={handleError}
              className="h-10 w-auto max-w-[140px] object-contain"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: wallet.logoColor }}
            >
              {wallet.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{wallet.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ color: typeConfig.color, backgroundColor: typeConfig.bg }}
            >
              <Fa icon={typeConfig.icon} variant="light" size={10} />
              {typeConfig.label}
            </span>
            {wallet.japaneseSupport && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/70 text-red-600">
                🇯🇵 日本語対応
              </span>
            )}
            {wallet.isFree && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/70 text-green-600">
                無料
              </span>
            )}
            <span className="text-xs text-gray-500">{wallet.established}年</span>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-xl hover:bg-black/10 transition-colors flex-shrink-0"
      >
        <Fa icon="xmark" size={18} className="text-gray-600" />
      </button>
    </div>
  );
}

/* ===== メインモーダル ===== */
export default function WalletModal({ wallet, onClose }: WalletModalProps) {
  const secConfig = SECURITY_CONFIG[wallet.securityLevel];
  const score = wallet.trustScore;
  const scoreCol = scoreColor(score);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* モーダル本体：取引所と同じ flex flex-col 構造 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        <ModalLogoHeader wallet={wallet} onClose={onClose} />

        {/* スクロール領域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* 説明 */}
          <p className="text-gray-600 leading-relaxed">{wallet.description}</p>

          {/* 基本情報グリッド */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Fa icon={wallet.isFree ? "circle-check" : "circle-yen"} size={13} className={wallet.isFree ? "text-green-500" : "text-blue-500"} />
                <span className="text-xs text-gray-500">料金</span>
              </div>
              <span className={`text-sm font-semibold ${wallet.isFree ? "text-green-600" : "text-gray-700"}`}>
                {wallet.isFree ? "無料" : wallet.priceNote ?? "有料"}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Fa icon="shield-halved" size={13} className="text-purple-500" />
                <span className="text-xs text-gray-500">セキュリティ</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: secConfig.color }}>
                {secConfig.label}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Fa icon="link" variant="light" size={13} className="text-blue-500" />
                <span className="text-xs text-gray-500">対応チェーン</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{wallet.chains.length}チェーン</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Fa icon="calendar" size={13} className="text-yellow-500" />
                <span className="text-xs text-gray-500">設立年</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{wallet.established}年</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{new Date().getFullYear() - wallet.established}年運営</p>
            </div>
          </div>

          {/* 信頼スコア */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Fa icon="shield-check" size={14} className="text-yellow-500" />
                <span className="text-sm font-bold text-gray-700">信頼スコア</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black" style={{ color: scoreCol }}>{score.toFixed(1)}</span>
                <span className="text-sm text-gray-400">/ 10</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div className="h-2 rounded-full transition-all" style={{ width: `${(score / 10) * 100}%`, backgroundColor: scoreCol }} />
            </div>
            {/* セキュリティ詳細 */}
            <div className="flex items-start gap-2 rounded-xl p-3 border border-gray-100" style={{ backgroundColor: `${secConfig.bg}` }}>
              <Fa icon="shield-halved" size={13} className="flex-shrink-0 mt-0.5" style={{ color: secConfig.color }} />
              <p className="text-xs leading-relaxed" style={{ color: secConfig.color }}>{secConfig.desc}</p>
            </div>
          </div>

          {/* 対応ブロックチェーン */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
              <Fa icon="link" variant="light" size={13} className="text-gray-500" />
              <h4 className="font-semibold text-gray-800 text-sm">対応ブロックチェーン</h4>
              <span className="text-xs text-gray-400 ml-auto">{wallet.chains.length}チェーン</span>
            </div>
            <div className="p-4 bg-white flex flex-wrap gap-2">
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
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
                <Fa icon="star" variant="light" size={13} className="text-gray-500" />
                <h4 className="font-semibold text-gray-800 text-sm">主な機能</h4>
                <span className="text-xs text-gray-400 ml-auto">{wallet.features.filter(f => FEATURE_CONFIG[f]).length}件</span>
              </div>
              <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {wallet.features.map((f) => {
                  const cfg = FEATURE_CONFIG[f];
                  if (!cfg) return null;
                  return (
                    <div key={f} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Fa icon={cfg.icon} variant="light" size={12} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{cfg.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{cfg.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 特記事項 */}
          {wallet.notes && (
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <Fa icon="circle-info" size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">{wallet.notes}</p>
            </div>
          )}

          {/* 公式サイトボタン */}
          <div>
            <a
              href={wallet.affiliateUrl ?? wallet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: wallet.logoColor }}
            >
              <Fa icon="arrow-up-right-from-square" size={15} />
              公式サイトを見る
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

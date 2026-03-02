"use client";

import { useState } from "react";
import { Exchange, Feature } from "@/types/exchange";
import { FEATURE_LABELS } from "@/data/exchanges";
import { getSpreadConfig } from "@/lib/spreadUtils";
import {
  X,
  ExternalLink,
  Coins,
  Star,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Store,
} from "lucide-react";

interface ExchangeModalProps {
  exchange: Exchange;
  onClose: () => void;
}

const FEATURE_ICONS: Partial<Record<Feature, string>> = {
  spot: "💹",
  futures: "📈",
  margin: "⚡",
  staking: "🏦",
  lending: "💰",
  nft: "🖼️",
  copy_trading: "📋",
  options: "🎯",
  demo: "🧪",
  api: "🔌",
  mobile_app: "📱",
  japan_yen_deposit: "¥",
  credit_card: "💳",
};

const AMOUNTS = [10000, 100000, 1000000];

/* ===== 取引所（板取引）セクション ===== */
function ExchangeTradingSection({ exchange }: { exchange: Exchange }) {
  const { fees } = exchange;
  if (fees.exchangeMaker === undefined && fees.exchangeTaker === undefined) return null;

  const makerIsRebate = (fees.exchangeMaker ?? 0) < 0;

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
        <BookOpen size={14} className="text-gray-500" />
        <h4 className="font-semibold text-gray-800 text-sm">取引所（板取引）</h4>
        <span className="text-xs text-gray-400 ml-auto">Order Book</span>
      </div>

      <div className="p-4 bg-white space-y-4">
        {/* 説明 */}
        <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-gray-200 pl-3">
          ユーザー同士が売買注文を出し合う市場です。
          指値注文で流動性を提供する側（<strong className="text-gray-700">Maker</strong>）と、
          成行注文で即時約定させる側（<strong className="text-gray-700">Taker</strong>）で手数料が異なります。
          一般的に板取引の方がスプレッドが狭く、実質コストを抑えられます。
        </p>

        {/* Maker / Taker 料率 */}
        <div className="grid grid-cols-2 gap-3">
          {fees.exchangeMaker !== undefined && (
            <div className="rounded-xl p-3 text-center bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Maker（指値）</p>
              <p className={`text-2xl font-black ${makerIsRebate ? "text-emerald-600" : "text-gray-800"}`}>
                {fees.exchangeMaker.toFixed(2)}%
              </p>
              {makerIsRebate && (
                <p className="text-xs font-medium text-emerald-600 mt-0.5">リベート（受け取り）</p>
              )}
            </div>
          )}
          {fees.exchangeTaker !== undefined && (
            <div className="rounded-xl p-3 text-center bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Taker（成行）</p>
              <p className="text-2xl font-black text-gray-800">
                {fees.exchangeTaker.toFixed(2)}%
              </p>
            </div>
          )}
        </div>

        {/* 金額別コスト（Takerベース） */}
        {fees.exchangeTaker !== undefined && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Taker手数料（金額別）</p>
            <div className="grid grid-cols-3 gap-2">
              {AMOUNTS.map((amount) => (
                <div key={amount} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                  <p className="text-[10px] text-gray-400">{(amount / 10000).toLocaleString()}万円</p>
                  <p className="text-sm font-bold text-gray-700">
                    {((amount * (fees.exchangeTaker ?? 0)) / 100).toLocaleString()}円
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== 販売所（相対取引）セクション ===== */
function DealerTradingSection({ exchange }: { exchange: Exchange }) {
  const { fees } = exchange;
  if (fees.dealerSpread === undefined) return null;

  const cfg = getSpreadConfig(fees.spreadRating);
  const isAlert = fees.spreadRating === "wide" || fees.spreadRating === "very_wide";

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
        <Store size={14} className="text-gray-500" />
        <h4 className="font-semibold text-gray-800 text-sm">販売所（相対取引）</h4>
        <span className="text-xs font-medium ml-auto" style={{ color: cfg.color }}>
          スプレッド {cfg.label}
        </span>
      </div>

      <div className="p-4 bg-white space-y-4">
        {/* 説明 */}
        <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-gray-200 pl-3">
          取引所が売買価格を提示し、ユーザーはその価格で売買します。
          注文は即時成立しますが、<strong className="text-gray-700">売値と買値の差（スプレッド）が実質的なコスト</strong>になります。
          「手数料無料」と表示されていても、このスプレッドは別途発生します。
        </p>

        {/* スプレッド率 + 往復コスト */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 text-center bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">スプレッド目安</p>
            <p className="text-2xl font-black" style={{ color: cfg.color }}>
              ≈{fees.dealerSpread.toFixed(1)}%
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">買値と売値の差</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">往復コスト目安</p>
            <p className="text-2xl font-black" style={{ color: cfg.color }}>
              ≈{fees.roundTripCostPct.toFixed(2)}%
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">買→即売の損失率</p>
          </div>
        </div>

        {/* 警告メッセージ */}
        {isAlert && (
          <div className="flex items-start gap-2.5 rounded-xl p-3 bg-gray-50 border border-gray-200">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
            <p className="text-xs text-gray-600 leading-relaxed">
              {fees.spreadRating === "very_wide"
                ? "このスプレッドは非常に広く、頻繁な売買には不向きです。少額の積立などの用途に限定するか、取引所機能（板取引）の利用を強く推奨します。"
                : "スプレッドが広めです。まとまった金額を取引する場合は事前に実際の価格差を確認することをお勧めします。"}
            </p>
          </div>
        )}

        {/* 金額別コスト */}
        <div>
          <p className="text-xs text-gray-400 mb-2">往復コスト（金額別）</p>
          <div className="grid grid-cols-3 gap-2">
            {AMOUNTS.map((amount) => (
              <div key={amount} className="rounded-lg p-2 text-center bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400">{(amount / 10000).toLocaleString()}万円</p>
                <p className="text-sm font-bold" style={{ color: cfg.color }}>
                  {((amount * fees.roundTripCostPct) / 100).toLocaleString()}円
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== ロゴヘッダー ===== */
function ModalLogoHeader({ exchange, onClose }: { exchange: Exchange; onClose: () => void }) {
  const localSrc = exchange.logoFile ? `/logos/${exchange.logoFile}` : null;
  const clearbitSrc = `https://logo.clearbit.com/${exchange.domain}`;
  const [src, setSrc] = useState<string | null>(localSrc ?? clearbitSrc);
  const [fallback, setFallback] = useState(false);

  const handleError = () => {
    if (src === localSrc) setSrc(clearbitSrc);
    else setFallback(true);
  };

  const hasExchange = exchange.fees.exchangeMaker !== undefined || exchange.fees.exchangeTaker !== undefined;
  const hasDealer = exchange.fees.dealerSpread !== undefined;

  return (
    <div
      className="rounded-t-2xl px-6 py-5 flex items-center justify-between flex-shrink-0"
      style={{ backgroundColor: `${exchange.logoColor}18` }}
    >
      <div className="flex items-center gap-4">
        {/* 白座布団ロゴ */}
        <div className="bg-white rounded-xl p-2 flex items-center justify-center flex-shrink-0">
          {!fallback && src ? (
            <img src={src} alt={exchange.name} onError={handleError} className="h-10 w-auto max-w-[110px] object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: exchange.logoColor }}>
              {exchange.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{exchange.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/70 text-gray-600">
              {exchange.region === "domestic" ? "国内" : "海外"}
            </span>
            {hasExchange && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/70 text-gray-600 flex items-center gap-1">
                <BookOpen size={10} /> 取引所
              </span>
            )}
            {hasDealer && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/70 text-gray-600 flex items-center gap-1">
                <Store size={10} /> 販売所
              </span>
            )}
            <span className="text-xs text-gray-500">{exchange.country} · {exchange.established}年</span>
          </div>
        </div>
      </div>
      <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/10 transition-colors flex-shrink-0">
        <X size={20} className="text-gray-600" />
      </button>
    </div>
  );
}

/* ===== メインモーダル ===== */
export default function ExchangeModal({ exchange, onClose }: ExchangeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <ModalLogoHeader exchange={exchange} onClose={onClose} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 説明 */}
          <p className="text-gray-600 leading-relaxed">{exchange.description}</p>

          {/* 基本情報 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {exchange.fsaRegistered ? <CheckCircle size={13} className="text-green-500" /> : <XCircle size={13} className="text-gray-400" />}
                <span className="text-xs text-gray-500">金融庁登録</span>
              </div>
              <span className={`text-sm font-semibold ${exchange.fsaRegistered ? "text-green-600" : "text-gray-400"}`}>
                {exchange.fsaRegistered ? "登録済み" : "なし"}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star size={13} className="text-yellow-500" />
                <span className="text-xs text-gray-500">セキュリティ評価</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {"★".repeat(exchange.trustScore)}{"☆".repeat(5 - exchange.trustScore)}
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5">事故歴ベース</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Coins size={13} className="text-blue-500" />
                <span className="text-xs text-gray-500">取引ペア数</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{exchange.tradingPairs?.toLocaleString() ?? "—"}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp size={13} className="text-purple-500" />
                <span className="text-xs text-gray-500">最大レバレッジ</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{exchange.maxLeverage ? `${exchange.maxLeverage}倍` : "なし"}</span>
            </div>
          </div>

          {/* 取引コスト：取引所と販売所を分けて表示 */}
          <ExchangeTradingSection exchange={exchange} />
          <DealerTradingSection exchange={exchange} />

          {/* 入出金手数料 */}
          {(exchange.fees.depositFeeNote || exchange.fees.withdrawalFeeNote) && (
            <div className="grid grid-cols-2 gap-3">
              {exchange.fees.depositFeeNote && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">入金手数料</p>
                  <p className="text-sm text-gray-700">{exchange.fees.depositFeeNote}</p>
                </div>
              )}
              {exchange.fees.withdrawalFeeNote && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">出金手数料</p>
                  <p className="text-sm text-gray-700">{exchange.fees.withdrawalFeeNote}</p>
                </div>
              )}
            </div>
          )}

          {/* 対応トークン */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Coins size={16} className="text-gray-600" />
              対応トークン
              {exchange.region === "domestic" && (
                <span className="text-gray-400 font-normal text-sm">({exchange.tokens.length}銘柄)</span>
              )}
            </h3>
            {exchange.region === "domestic" ? (
              <div className="flex flex-wrap gap-1.5">
                {exchange.tokens.map((token) => (
                  <span key={token} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    {token}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <Coins size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500">
                  {exchange.tradingPairs?.toLocaleString() ?? "多数"}銘柄以上に対応（日々変動）
                </span>
                {exchange.tokensUrl && (
                  <a
                    href={exchange.tokensUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0"
                  >
                    銘柄一覧を見る <ExternalLink size={11} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 機能一覧 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              提供機能 <span className="text-gray-400 font-normal text-sm">({exchange.features.length})</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {exchange.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span>{FEATURE_ICONS[feature] ?? "✓"}</span>
                  <span className="text-sm text-gray-700">{FEATURE_LABELS[feature] ?? feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* セキュリティ評価基準 */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-left"
              onClick={(e) => {
                const el = e.currentTarget.nextElementSibling as HTMLElement;
                el.style.display = el.style.display === "none" ? "block" : "none";
              }}
            >
              <div className="flex items-center gap-2">
                <Info size={13} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500">セキュリティ評価スコアの基準</span>
              </div>
              <span className="text-xs text-gray-400">タップで展開</span>
            </button>
            <div style={{ display: "none" }} className="px-4 py-3 bg-white">
              <table className="w-full text-xs text-gray-600 border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-1.5 pr-3 font-semibold text-gray-700 w-12">スコア</th>
                    <th className="text-left py-1.5 font-semibold text-gray-700">基準</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr><td className="py-1.5 pr-3 font-bold">★★★★★</td><td className="py-1.5">重大事故なし・長期運営（5年以上）・金融庁登録または主要国の規制あり</td></tr>
                  <tr><td className="py-1.5 pr-3 font-bold">★★★★☆</td><td className="py-1.5">重大事故なし・運営5年未満、または主要規制登録なし</td></tr>
                  <tr><td className="py-1.5 pr-3 font-bold">★★★☆☆</td><td className="py-1.5">軽微なインシデントあり、または親会社・グループに事故歴あり</td></tr>
                  <tr><td className="py-1.5 pr-3 font-bold">★★☆☆☆</td><td className="py-1.5">重大なセキュリティ事故あり（補償済み・運営継続中）</td></tr>
                  <tr><td className="py-1.5 pr-3 font-bold">★☆☆☆☆</td><td className="py-1.5">重大なセキュリティ事故あり（未補償・サービス終了）</td></tr>
                </tbody>
              </table>
              <p className="text-[10px] text-gray-400 mt-2">※当サイト独自の評価です。投資判断の参考としてのみご利用ください。</p>
            </div>
          </div>

          {/* 特記事項 */}
          {exchange.notes && (
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <Info size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">{exchange.notes}</p>
            </div>
          )}

          {/* ボタン */}
          <div className="space-y-2.5">
            <a
              href={exchange.affiliateUrl || exchange.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: exchange.logoColor }}
            >
              <ExternalLink size={16} />
              公式サイトを見る
            </a>
            {exchange.affiliateNote && (
              <p className="text-xs text-gray-400 text-center px-2">💡 {exchange.affiliateNote}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

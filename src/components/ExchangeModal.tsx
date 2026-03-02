"use client";

import { useState } from "react";
import { Exchange, Feature } from "@/types/exchange";
import { FEATURE_LABELS } from "@/data/exchanges";
import {
  X,
  ExternalLink,
  Shield,
  TrendingUp,
  Coins,
  Star,
  CheckCircle,
  XCircle,
  Info,
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

function FeeBadge({ value, label }: { value?: number; label: string }) {
  if (value === undefined) return null;
  const isNegative = value < 0;
  const isZero = value === 0;
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3 min-w-[90px]">
      <span className="text-xs text-gray-500 mb-1">{label}</span>
      <span
        className={`text-lg font-bold ${
          isNegative
            ? "text-green-600"
            : isZero
            ? "text-blue-600"
            : "text-gray-800"
        }`}
      >
        {isNegative ? "" : value > 0 ? "+" : ""}
        {value.toFixed(2)}%
      </span>
      {isNegative && (
        <span className="text-xs text-green-600 font-medium">リベート</span>
      )}
      {isZero && <span className="text-xs text-blue-600 font-medium">無料</span>}
    </div>
  );
}

function CostSimulator({ exchange }: { exchange: Exchange }) {
  const amounts = [10000, 100000, 1000000];

  const calcCost = (amount: number) => {
    const { fees } = exchange;
    if (fees.exchangeTaker !== undefined) {
      return {
        type: "取引所",
        maker:
          fees.exchangeMaker !== undefined
            ? Math.abs(amount * (fees.exchangeMaker / 100))
            : null,
        taker: amount * (fees.exchangeTaker / 100),
        isMakerRebate:
          fees.exchangeMaker !== undefined && fees.exchangeMaker < 0,
      };
    } else if (fees.dealerSpread !== undefined) {
      return {
        type: "販売所",
        spread: amount * (fees.dealerSpread / 100),
        taker: null,
        maker: null,
        isMakerRebate: false,
      };
    }
    return null;
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <TrendingUp size={16} />
        取引コストシミュレーター
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-200">
              <th className="text-left py-2 pr-4">取引金額</th>
              <th className="text-right py-2 px-3">Maker手数料</th>
              <th className="text-right py-2 px-3">Taker手数料</th>
              <th className="text-right py-2">販売所スプレッド</th>
            </tr>
          </thead>
          <tbody>
            {amounts.map((amount) => {
              const cost = calcCost(amount);
              return (
                <tr key={amount} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-700">
                    {amount.toLocaleString()}円
                  </td>
                  <td className="py-2 px-3 text-right">
                    {cost?.maker !== null && cost?.maker !== undefined ? (
                      <span className={cost.isMakerRebate ? "text-green-600" : "text-gray-700"}>
                        {cost.isMakerRebate ? "-" : ""}
                        {cost.maker.toLocaleString()}円
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {cost?.taker !== null && cost?.taker !== undefined ? (
                      <span className="text-gray-700">
                        {cost.taker.toLocaleString()}円
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {cost?.spread !== undefined ? (
                      <span className="text-orange-600">
                        {cost.spread.toLocaleString()}円
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        ※ 販売所のスプレッドは目安です。実際は市況により変動します。
      </p>
    </div>
  );
}

function ModalLogoHeader({ exchange, onClose }: { exchange: Exchange; onClose: () => void }) {
  const localSrc = exchange.logoFile ? `/logos/${exchange.logoFile}` : null;
  const clearbitSrc = `https://logo.clearbit.com/${exchange.domain}`;
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
    <div
      className="sticky top-0 z-10 rounded-t-2xl overflow-hidden"
      style={{ borderBottom: `3px solid ${exchange.logoColor}` }}
    >
      <div
        className="px-6 py-5 flex items-center justify-between relative bg-white"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ backgroundColor: exchange.logoColor + "20", border: `1.5px solid ${exchange.logoColor}30` }}
          >
            {!fallback && src ? (
              <img
                src={src}
                alt={exchange.name}
                onError={handleError}
                className="w-9 h-9 object-contain"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: exchange.logoColor }}
              >
                {exchange.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{exchange.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  exchange.region === "domestic"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {exchange.region === "domestic" ? "国内" : "海外"}
              </span>
              <span className="text-xs text-gray-500">
                {exchange.country} · {exchange.established}年設立
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-black/5 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export default function ExchangeModal({
  exchange,
  onClose,
}: ExchangeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalLogoHeader exchange={exchange} onClose={onClose} />

        <div className="p-6 space-y-6">
          {/* 説明 */}
          <p className="text-gray-600 leading-relaxed">{exchange.description}</p>

          {/* 基本情報バッジ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {exchange.fsaRegistered ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <XCircle size={14} className="text-gray-400" />
                )}
                <span className="text-xs text-gray-500">金融庁登録</span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  exchange.fsaRegistered ? "text-green-600" : "text-gray-400"
                }`}
              >
                {exchange.fsaRegistered ? "登録済み" : "なし"}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star size={14} className="text-yellow-500" />
                <span className="text-xs text-gray-500">信頼スコア</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {"★".repeat(exchange.trustScore)}{"☆".repeat(5 - exchange.trustScore)}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Coins size={14} className="text-blue-500" />
                <span className="text-xs text-gray-500">取引ペア数</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {exchange.tradingPairs?.toLocaleString() ?? "—"}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp size={14} className="text-purple-500" />
                <span className="text-xs text-gray-500">最大レバレッジ</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {exchange.maxLeverage ? `${exchange.maxLeverage}倍` : "なし"}
              </span>
            </div>
          </div>

          {/* 手数料 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-gray-600" />
              手数料構造
            </h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <FeeBadge value={exchange.fees.exchangeMaker} label="Maker" />
              <FeeBadge value={exchange.fees.exchangeTaker} label="Taker" />
              <FeeBadge value={exchange.fees.dealerSpread} label="販売所スプレッド" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {exchange.fees.depositFeeNote && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium mb-1">入金手数料</p>
                  <p className="text-sm text-gray-700">{exchange.fees.depositFeeNote}</p>
                </div>
              )}
              {exchange.fees.withdrawalFeeNote && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-orange-600 font-medium mb-1">出金手数料</p>
                  <p className="text-sm text-gray-700">{exchange.fees.withdrawalFeeNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* コストシミュレーター */}
          <CostSimulator exchange={exchange} />

          {/* 対応トークン */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Coins size={16} className="text-gray-600" />
              対応トークン ({exchange.tokens.length}銘柄)
            </h3>
            <div className="flex flex-wrap gap-2">
              {exchange.tokens.map((token) => (
                <span
                  key={token}
                  className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                >
                  {token}
                </span>
              ))}
            </div>
          </div>

          {/* 機能一覧 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              提供機能 ({exchange.features.length}機能)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {exchange.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span>{FEATURE_ICONS[feature] ?? "✓"}</span>
                  <span className="text-sm text-gray-700">
                    {FEATURE_LABELS[feature] ?? feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 特記事項 */}
          {exchange.notes && (
            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <Info size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">{exchange.notes}</p>
            </div>
          )}

          {/* ボタンエリア */}
          <div className="space-y-2.5">
            {/* アフィリエイト/リファラルリンク */}
            {exchange.affiliateType !== "none" && (
              exchange.affiliateUrl ? (
                <a
                  href={exchange.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: exchange.logoColor }}
                >
                  <ExternalLink size={16} />
                  {exchange.name} で口座開設する
                  {exchange.affiliateType === "referral" && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-1">
                      紹介リンク
                    </span>
                  )}
                </a>
              ) : (
                <div
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white/70 cursor-not-allowed"
                  style={{ backgroundColor: exchange.logoColor + "99" }}
                  title={exchange.affiliateNote}
                >
                  <ExternalLink size={16} />
                  {exchange.name} で口座開設する
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-1">
                    リンク未設定
                  </span>
                </div>
              )
            )}

            {/* 公式サイトへ */}
            <a
              href={exchange.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-medium transition-colors border ${
                exchange.affiliateType !== "none"
                  ? "text-gray-600 border-gray-200 hover:bg-gray-50 bg-white text-sm"
                  : "text-white font-semibold hover:opacity-90"
              }`}
              style={
                exchange.affiliateType === "none"
                  ? { backgroundColor: exchange.logoColor }
                  : undefined
              }
            >
              <ExternalLink size={14} />
              公式サイトを見る
            </a>

            {/* アフィリエイト情報メモ */}
            {exchange.affiliateNote && (
              <p className="text-xs text-gray-400 text-center px-2">
                💡 {exchange.affiliateNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

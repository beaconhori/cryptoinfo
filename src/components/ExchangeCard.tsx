"use client";

import { useState } from "react";
import { Exchange } from "@/types/exchange";
import Fa from "@/components/Fa";
import { getSpreadConfig } from "@/lib/spreadUtils";
import { calcTotalScore } from "@/lib/scoreUtils";

function scoreColor(score: number): string {
  if (score >= 8.5) return "#10B981"; // emerald
  if (score >= 7.0) return "#3B82F6"; // blue
  if (score >= 5.5) return "#F59E0B"; // amber
  return "#EF4444"; // red
}

interface ExchangeCardProps {
  exchange: Exchange;
  onClick: () => void;
  highlightTokens?: string[];
}

function CardBanner({ exchange }: { exchange: Exchange }) {
  // ローカルロゴ → Clearbit → イニシャルの順でフォールバック
  const localSrc = exchange.logoFile ? `/logos/${exchange.logoFile}` : null;
  const clearbitSrc = `https://logo.clearbit.com/${exchange.domain}`;

  const [src, setSrc] = useState<string | null>(localSrc ?? clearbitSrc);
  const [fallback, setFallback] = useState(false);

  const handleError = () => {
    if (src === localSrc) {
      // ローカル失敗 → Clearbitを試す
      setSrc(clearbitSrc);
    } else {
      // Clearbitも失敗 → イニシャル表示
      setFallback(true);
    }
  };

  return (
    <div className="h-32 w-full relative overflow-hidden flex items-center justify-center bg-white">
      {!fallback && src ? (
        <img
          src={src}
          alt={`${exchange.name} logo`}
          onError={handleError}
          className="relative z-10 h-12 w-auto max-w-[150px] object-contain drop-shadow-sm"
        />
      ) : (
        <div
          className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
          style={{ backgroundColor: exchange.logoColor }}
        >
          {exchange.name.charAt(0)}
        </div>
      )}
    </div>
  );
}

export default function ExchangeCard({
  exchange,
  onClick,
  highlightTokens = [],
}: ExchangeCardProps) {
  const isDex = exchange.region === "dex";
  const hasExchange = exchange.fees.exchangeMaker !== undefined || exchange.fees.exchangeTaker !== undefined;
  const hasDealer = exchange.fees.dealerSpread !== undefined;

  const hasHighlight = highlightTokens.some((t) =>
    exchange.tokens.includes(t as never)
  );

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200 group ${
        hasHighlight ? "ring-2 ring-amber-300" : ""
      }`}
    >
      <CardBanner exchange={exchange} />

      <div
        className="p-4"
        style={{ backgroundColor: `${exchange.logoColor}12` }}
      >
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-bold text-gray-900 text-sm leading-snug pr-1.5 flex-1">
            {exchange.name}
          </h3>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 -mr-0.5 -mt-0.5"
          >
            <Fa icon="ellipsis" size={15} />
          </button>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {exchange.description}
        </p>

        {/* 手数料情報 */}
        {isDex ? (
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white">
              <div className="flex items-center gap-1.5">
                <Fa icon="bolt" size={10} className="text-emerald-500 flex-shrink-0" />
                <span className="text-[10px] font-bold text-gray-600">オンチェーン</span>
              </div>
              <span className="flex items-center gap-2 text-xs">
                {exchange.fees.exchangeMaker !== undefined && (
                  <span className={exchange.fees.exchangeMaker <= 0 ? "text-emerald-600 font-bold" : "text-gray-400"}>
                    M: {exchange.fees.exchangeMaker > 0 ? exchange.fees.exchangeMaker.toFixed(3) : exchange.fees.exchangeMaker.toFixed(3)}%
                  </span>
                )}
                {exchange.fees.exchangeTaker !== undefined && (
                  <span className="text-gray-700 font-semibold">
                    T: {exchange.fees.exchangeTaker.toFixed(3)}%
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50">
              <span className="text-[10px] font-bold text-emerald-600">KYC不要・ノンカストディアル</span>
            </div>
          </div>
        ) : (
          (() => {
            const cfg = getSpreadConfig(exchange.fees.spreadRating);
            return (
              <div className="space-y-1 mb-3">
                {hasExchange ? (
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white">
                    <div className="flex items-center gap-1.5">
                      <Fa icon="book-open" size={10} className="text-gray-400 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-gray-600">取引所</span>
                    </div>
                    <span className="flex items-center gap-2 text-xs">
                      {exchange.fees.exchangeMaker !== undefined && (
                        <span className={exchange.fees.exchangeMaker < 0 ? "text-emerald-600 font-bold" : "text-gray-400"}>
                          M: {exchange.fees.exchangeMaker.toFixed(2)}%
                        </span>
                      )}
                      {exchange.fees.exchangeTaker !== undefined && (
                        <span className="text-gray-700 font-semibold">
                          T: {exchange.fees.exchangeTaker.toFixed(2)}%
                        </span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white">
                    <Fa icon="book-open" size={10} className="text-gray-300 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-gray-300">取引所なし</span>
                  </div>
                )}
                {hasDealer ? (
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white">
                    <div className="flex items-center gap-1.5">
                      <Fa icon="store" size={10} className="text-gray-400 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-gray-600">販売所</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: cfg.color }}>
                      SP ≈{exchange.fees.dealerSpread?.toFixed(1)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white">
                    <Fa icon="store" size={10} className="text-gray-300 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-gray-300">販売所なし</span>
                  </div>
                )}
              </div>
            );
          })()
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{exchange.established}年設立</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">総合</span>
            <span className="text-sm font-black" style={{ color: scoreColor(calcTotalScore(exchange)) }}>
              {calcTotalScore(exchange).toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-400">/ 10</span>
          </div>
        </div>
      </div>
    </div>
  );
}

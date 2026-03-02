"use client";

import { useState } from "react";
import { Exchange } from "@/types/exchange";
import { MoreHorizontal, Percent, CheckCircle, AlertTriangle } from "lucide-react";
import { getSpreadConfig } from "@/lib/spreadUtils";

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
  const feeDisplay =
    exchange.fees.exchangeTaker !== undefined
      ? `Taker ${exchange.fees.exchangeTaker.toFixed(2)}%`
      : exchange.fees.dealerSpread !== undefined
      ? `SP ≈${exchange.fees.dealerSpread.toFixed(1)}%`
      : "—";

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
            <MoreHorizontal size={16} />
          </button>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {exchange.description}
        </p>

        {/* 実質コストバッジ */}
        {(() => {
          const cfg = getSpreadConfig(exchange.fees.spreadRating);
          const isAlert = exchange.fees.spreadRating === "wide" || exchange.fees.spreadRating === "very_wide";
          return (
            <div
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 mb-3 border"
              style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
            >
              <div className="flex items-center gap-1.5">
                {isAlert && <AlertTriangle size={11} style={{ color: cfg.color }} />}
                <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>
                  実質コスト（往復）
                </span>
              </div>
              <span className="text-xs font-bold" style={{ color: cfg.color }}>
                ≈ {exchange.fees.roundTripCostPct.toFixed(2)}%
              </span>
            </div>
          );
        })()}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1" style={{ color: `${exchange.logoColor}cc` }}>
            <Percent size={11} />
            <span className="text-xs font-medium">{feeDisplay}</span>
          </div>

          <div className="flex items-center -space-x-1.5">
            {exchange.fsaRegistered && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-sm border-2"
                style={{
                  backgroundColor: `${exchange.logoColor}18`,
                  borderColor: "white",
                }}
              >
                <CheckCircle size={12} className="text-green-500" />
              </div>
            )}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-sm"
              style={{ backgroundColor: exchange.logoColor }}
            >
              {exchange.name.charAt(0)}
            </div>
            {exchange.trustScore >= 5 && (
              <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
                ★
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

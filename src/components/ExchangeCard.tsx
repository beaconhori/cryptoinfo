"use client";

import { Exchange } from "@/types/exchange";
import { MoreHorizontal, Percent, CheckCircle } from "lucide-react";

interface ExchangeCardProps {
  exchange: Exchange;
  onClick: () => void;
  highlightTokens?: string[];
}

function CardBanner({ color }: { color: string }) {
  return (
    <div
      className="h-32 w-full relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}12 0%, ${color}35 100%)`,
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: 130,
          height: 130,
          backgroundColor: color,
          opacity: 0.18,
          top: -35,
          right: -35,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 90,
          height: 90,
          backgroundColor: color,
          opacity: 0.12,
          bottom: -25,
          right: 30,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 55,
          height: 55,
          backgroundColor: color,
          opacity: 0.15,
          top: 18,
          left: -12,
        }}
      />
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
        hasHighlight ? "ring-2 ring-yellow-300" : ""
      }`}
    >
      <CardBanner color={exchange.logoColor} />

      <div className="p-4">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-bold text-gray-900 text-sm leading-snug pr-1.5 flex-1">
            {exchange.name}
          </h3>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 -mr-0.5 -mt-0.5"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {exchange.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-400">
            <Percent size={11} />
            <span className="text-xs">{feeDisplay}</span>
          </div>

          <div className="flex items-center -space-x-1.5">
            {exchange.fsaRegistered && (
              <div className="w-6 h-6 rounded-full bg-green-50 border-2 border-white flex items-center justify-center z-10 shadow-sm">
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
              <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
                ★
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

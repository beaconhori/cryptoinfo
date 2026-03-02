"use client";

import { Exchange } from "@/types/exchange";
import { FEATURE_LABELS } from "@/data/exchanges";
import { Shield, ExternalLink, ChevronRight, CheckCircle } from "lucide-react";

interface ExchangeCardProps {
  exchange: Exchange;
  onClick: () => void;
  highlightTokens?: string[];
}

function FeeDisplay({ exchange }: { exchange: Exchange }) {
  const { fees } = exchange;
  if (fees.exchangeTaker !== undefined) {
    return (
      <div className="flex gap-3">
        {fees.exchangeMaker !== undefined && (
          <div className="text-center">
            <p className="text-xs text-gray-400">Maker</p>
            <p
              className={`text-sm font-bold ${
                fees.exchangeMaker < 0 ? "text-green-600" : fees.exchangeMaker === 0 ? "text-blue-600" : "text-gray-800"
              }`}
            >
              {fees.exchangeMaker < 0 ? "" : ""}{fees.exchangeMaker.toFixed(2)}%
            </p>
          </div>
        )}
        <div className="text-center">
          <p className="text-xs text-gray-400">Taker</p>
          <p className={`text-sm font-bold ${fees.exchangeTaker === 0 ? "text-blue-600" : "text-gray-800"}`}>
            {fees.exchangeTaker.toFixed(2)}%
          </p>
        </div>
      </div>
    );
  }
  if (fees.dealerSpread !== undefined) {
    return (
      <div className="text-center">
        <p className="text-xs text-gray-400">スプレッド</p>
        <p className="text-sm font-bold text-orange-600">{fees.dealerSpread.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
}

export default function ExchangeCard({
  exchange,
  onClick,
  highlightTokens = [],
}: ExchangeCardProps) {
  const displayTokens = exchange.tokens.slice(0, 8);
  const remainingCount = exchange.tokens.length - displayTokens.length;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* カラーバー */}
      <div className="h-1.5 w-full" style={{ backgroundColor: exchange.logoColor }} />

      <div className="p-5">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: exchange.logoColor }}
            >
              {exchange.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                {exchange.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    exchange.region === "domestic"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {exchange.region === "domestic" ? "国内" : "海外"}
                </span>
                {exchange.fsaRegistered && (
                  <span className="flex items-center gap-0.5 text-xs text-green-600">
                    <CheckCircle size={11} />
                    金融庁
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-1"
          />
        </div>

        {/* 説明文 */}
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {exchange.description}
        </p>

        {/* 手数料 */}
        <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">手数料</span>
          </div>
          <FeeDisplay exchange={exchange} />
        </div>

        {/* 信頼スコア */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-sm ${i < exchange.trustScore ? "text-yellow-400" : "text-gray-200"}`}
            >
              ★
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-1">信頼度</span>
        </div>

        {/* トークン */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {displayTokens.map((token) => (
            <span
              key={token}
              className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${
                highlightTokens.includes(token)
                  ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {token}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-md">
              +{remainingCount}
            </span>
          )}
        </div>

        {/* 機能タグ (最大3つ) */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {exchange.features.slice(0, 4).map((feature) => (
            <span
              key={feature}
              className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md"
            >
              {FEATURE_LABELS[feature] ?? feature}
            </span>
          ))}
          {exchange.features.length > 4 && (
            <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md">
              +{exchange.features.length - 4}
            </span>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            {exchange.tradingPairs?.toLocaleString() ?? "—"} 通貨ペア
          </span>
          <a
            href={exchange.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink size={11} />
            公式
          </a>
        </div>
      </div>
    </div>
  );
}

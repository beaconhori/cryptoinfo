"use client";

import { Feature } from "@/types/exchange";
import { FEATURE_LABELS, ALL_TOKENS } from "@/data/exchanges";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useState } from "react";

export interface FilterState {
  region: "all" | "domestic" | "overseas" | "dex";
  tokens: string[];
  features: Feature[];
  fsaOnly: boolean;
  searchText: string;
}

export type SortKey =
  | "name"
  | "trustScore"
  | "takerFee"
  | "makerFee"
  | "tradingPairs"
  | "established";

interface CompactFilterProps {
  filter: FilterState;
  sortKey: SortKey;
  onFilterChange: (filter: FilterState) => void;
  onSortChange: (key: SortKey) => void;
  resultCount: number;
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "trustScore", label: "信頼スコア順" },
  { key: "takerFee", label: "Taker手数料（安い順）" },
  { key: "makerFee", label: "Maker手数料（安い順）" },
  { key: "tradingPairs", label: "取引ペア数（多い順）" },
  { key: "established", label: "設立年（古い順）" },
  { key: "name", label: "名前順" },
];

const COMMON_TOKENS = ["BTC", "ETH", "XRP", "SOL", "ADA", "DOGE", "USDT"];

const FEATURE_QUICK: Feature[] = [
  "spot",
  "futures",
  "margin",
  "staking",
  "copy_trading",
  "japan_yen_deposit",
];

export default function CompactFilter({
  filter,
  sortKey,
  onFilterChange,
  onSortChange,
  resultCount,
}: CompactFilterProps) {
  const [showTokenPanel, setShowTokenPanel] = useState(false);
  const [showFeaturePanel, setShowFeaturePanel] = useState(false);

  const update = (partial: Partial<FilterState>) =>
    onFilterChange({ ...filter, ...partial });

  const toggleToken = (token: string) => {
    const next = filter.tokens.includes(token)
      ? filter.tokens.filter((t) => t !== token)
      : [...filter.tokens, token];
    update({ tokens: next });
  };

  const toggleFeature = (feature: Feature) => {
    const next = filter.features.includes(feature)
      ? filter.features.filter((f) => f !== feature)
      : [...filter.features, feature];
    update({ features: next });
  };

  const hasFilters =
    filter.tokens.length > 0 || filter.features.length > 0 || filter.fsaOnly;

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 flex-wrap relative z-20">
      <SlidersHorizontal size={14} className="text-gray-400 flex-shrink-0" />

      {/* クイックトークン */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {COMMON_TOKENS.map((token) => (
          <button
            key={token}
            onClick={() => toggleToken(token)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              filter.tokens.includes(token)
                ? "bg-amber-400 text-amber-900 shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {token}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-gray-200 flex-shrink-0" />

      {/* 機能クイック選択 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FEATURE_QUICK.map((feature) => (
          <button
            key={feature}
            onClick={() => toggleFeature(feature)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              filter.features.includes(feature)
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {FEATURE_LABELS[feature]}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-gray-200 flex-shrink-0" />

      {/* 全銘柄ドロップダウン */}
      <div className="relative">
        <button
          onClick={() => {
            setShowTokenPanel(!showTokenPanel);
            setShowFeaturePanel(false);
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
            filter.tokens.length > 0
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
          }`}
        >
          全銘柄
          {filter.tokens.length > 0 && (
            <span className="bg-amber-400 text-amber-900 rounded-full px-1.5 text-[10px] font-bold">
              {filter.tokens.length}
            </span>
          )}
          <ChevronDown size={11} />
        </button>
        {showTokenPanel && (
          <div className="absolute left-0 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-xl p-3 w-72 z-30">
            <p className="text-xs text-gray-400 mb-2">銘柄で絞り込み（AND条件）</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TOKENS.map((token) => (
                <button
                  key={token}
                  onClick={() => toggleToken(token)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filter.tokens.includes(token)
                      ? "bg-amber-400 text-amber-900"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 金融庁 */}
      <button
        onClick={() => update({ fsaOnly: !filter.fsaOnly })}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
          filter.fsaOnly
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
        }`}
      >
        🏛 金融庁登録
      </button>

      {/* リセット */}
      {hasFilters && (
        <button
          onClick={() =>
            onFilterChange({
              ...filter,
              tokens: [],
              features: [],
              fsaOnly: false,
            })
          }
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors px-1.5 py-1 rounded-lg hover:bg-red-50"
        >
          <X size={11} />
          クリア
        </button>
      )}

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-gray-400">{resultCount}件</span>
        {/* ソート */}
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="appearance-none pl-2.5 pr-7 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={11}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}

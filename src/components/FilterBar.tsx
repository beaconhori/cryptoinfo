"use client";

import { Feature } from "@/types/exchange";
import { FEATURE_LABELS, ALL_TOKENS } from "@/data/exchanges";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { useState } from "react";

export interface FilterState {
  region: "all" | "domestic" | "overseas";
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

interface FilterBarProps {
  filter: FilterState;
  sortKey: SortKey;
  onFilterChange: (filter: FilterState) => void;
  onSortChange: (key: SortKey) => void;
  resultCount: number;
}

const COMMON_TOKENS = ["BTC", "ETH", "XRP", "SOL", "ADA", "DOGE", "USDT"];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "trustScore", label: "信頼スコア順" },
  { key: "takerFee", label: "Taker手数料(安い順)" },
  { key: "makerFee", label: "Maker手数料(安い順)" },
  { key: "tradingPairs", label: "取引ペア数(多い順)" },
  { key: "established", label: "設立年(古い順)" },
  { key: "name", label: "名前順" },
];

const FEATURE_OPTIONS: Feature[] = [
  "spot",
  "futures",
  "margin",
  "staking",
  "lending",
  "nft",
  "copy_trading",
  "options",
  "demo",
  "japan_yen_deposit",
];

export default function FilterBar({
  filter,
  sortKey,
  onFilterChange,
  onSortChange,
  resultCount,
}: FilterBarProps) {
  const [showTokenFilter, setShowTokenFilter] = useState(false);
  const [showFeatureFilter, setShowFeatureFilter] = useState(false);

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

  const clearAll = () =>
    onFilterChange({
      region: "all",
      tokens: [],
      features: [],
      fsaOnly: false,
      searchText: "",
    });

  const hasFilters =
    filter.region !== "all" ||
    filter.tokens.length > 0 ||
    filter.features.length > 0 ||
    filter.fsaOnly ||
    filter.searchText !== "";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* 検索 & ソート */}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-0">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="取引所名で検索..."
            value={filter.searchText}
            onChange={(e) => update({ searchText: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
          />
          {filter.searchText && (
            <button
              onClick={() => update({ searchText: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* フィルター行 */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* 地域フィルター */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          {(
            [
              { value: "all", label: "すべて" },
              { value: "domestic", label: "国内" },
              { value: "overseas", label: "海外" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ region: opt.value })}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filter.region === opt.value
                  ? opt.value === "domestic"
                    ? "bg-blue-500 text-white"
                    : opt.value === "overseas"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-700 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 金融庁登録 */}
        <button
          onClick={() => update({ fsaOnly: !filter.fsaOnly })}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
            filter.fsaOnly
              ? "bg-green-500 text-white border-green-500"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          🏛️ 金融庁登録のみ
        </button>

        {/* トークンフィルター */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTokenFilter(!showTokenFilter);
              setShowFeatureFilter(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
              filter.tokens.length > 0
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Filter size={12} />
            銘柄
            {filter.tokens.length > 0 && (
              <span className="bg-white/30 rounded-full px-1.5 text-xs">
                {filter.tokens.length}
              </span>
            )}
            <ChevronDown size={12} />
          </button>
          {showTokenFilter && (
            <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-200 shadow-lg p-3 w-72">
              <p className="text-xs text-gray-500 mb-2">取扱銘柄で絞り込み（AND条件）</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TOKENS.map((token) => (
                  <button
                    key={token}
                    onClick={() => toggleToken(token)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filter.tokens.includes(token)
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {token}
                  </button>
                ))}
              </div>
              {filter.tokens.length > 0 && (
                <button
                  onClick={() => update({ tokens: [] })}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  クリア
                </button>
              )}
            </div>
          )}
        </div>

        {/* 機能フィルター */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFeatureFilter(!showFeatureFilter);
              setShowTokenFilter(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
              filter.features.length > 0
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Filter size={12} />
            機能
            {filter.features.length > 0 && (
              <span className="bg-white/30 rounded-full px-1.5 text-xs">
                {filter.features.length}
              </span>
            )}
            <ChevronDown size={12} />
          </button>
          {showFeatureFilter && (
            <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-200 shadow-lg p-3 w-72">
              <p className="text-xs text-gray-500 mb-2">機能で絞り込み（AND条件）</p>
              <div className="flex flex-wrap gap-1.5">
                {FEATURE_OPTIONS.map((feature) => (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filter.features.includes(feature)
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {FEATURE_LABELS[feature]}
                  </button>
                ))}
              </div>
              {filter.features.length > 0 && (
                <button
                  onClick={() => update({ features: [] })}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  クリア
                </button>
              )}
            </div>
          )}
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 transition-colors"
          >
            <X size={12} />
            リセット
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">
          {resultCount}件表示
        </span>
      </div>

      {/* クイックトークン選択 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-gray-400">クイック:</span>
        {COMMON_TOKENS.map((token) => (
          <button
            key={token}
            onClick={() => toggleToken(token)}
            className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
              filter.tokens.includes(token)
                ? "bg-yellow-400 text-yellow-900"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {token}
          </button>
        ))}
      </div>
    </div>
  );
}

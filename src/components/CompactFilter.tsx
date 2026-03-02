"use client";

import { Feature } from "@/types/exchange";
import { FEATURE_LABELS } from "@/data/exchanges";
import Fa from "@/components/Fa";

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
  const update = (partial: Partial<FilterState>) =>
    onFilterChange({ ...filter, ...partial });

  const toggleFeature = (feature: Feature) => {
    const next = filter.features.includes(feature)
      ? filter.features.filter((f) => f !== feature)
      : [...filter.features, feature];
    update({ features: next });
  };

  const hasFilters = filter.features.length > 0;

  return (
    <div className="bg-white border-b border-gray-100 relative z-20">
      {/* フィルターボタン（横スクロール） */}
      <div className="flex items-center gap-2 overflow-x-auto px-3 md:px-6 py-2 scrollbar-hide">
        <Fa icon="sliders" size={13} className="text-gray-300 flex-shrink-0" />
        {FEATURE_QUICK.map((feature) => (
          <button
            key={feature}
            onClick={() => toggleFeature(feature)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              filter.features.includes(feature)
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {FEATURE_LABELS[feature]}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={() => onFilterChange({ ...filter, features: [], fsaOnly: false })}
            className="flex-shrink-0 flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors px-1.5 py-1 rounded-lg hover:bg-red-50"
          >
            <Fa icon="xmark" size={10} />
            クリア
          </button>
        )}
      </div>
      {/* 件数＋ソート */}
      <div className="flex items-center justify-end gap-3 px-3 md:px-6 pb-2">
        <span className="text-xs text-gray-400">{resultCount}件</span>
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
          <Fa icon="chevron-down" size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

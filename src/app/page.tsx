"use client";

import { useState, useMemo, useCallback } from "react";
import { exchanges } from "@/data/exchanges";
import { Exchange } from "@/types/exchange";
import ExchangeCard from "@/components/ExchangeCard";
import ExchangeModal from "@/components/ExchangeModal";
import CostComparisonTable from "@/components/CostComparisonTable";
import CompactFilter, { FilterState, SortKey } from "@/components/CompactFilter";
import {
  BarChart3,
  Grid3X3,
  TableIcon,
  Settings,
  TrendingUp,
  Search,
  X,
  ChevronDown,
  Plus,
} from "lucide-react";

type ActiveTab = "list" | "compare";

const defaultFilter: FilterState = {
  region: "all",
  tokens: [],
  features: [],
  fsaOnly: false,
  searchText: "",
};

function sortExchanges(list: Exchange[], key: SortKey): Exchange[] {
  return [...list].sort((a, b) => {
    switch (key) {
      case "name":
        return a.name.localeCompare(b.name, "ja");
      case "trustScore":
        return b.trustScore - a.trustScore;
      case "takerFee": {
        const fa = a.fees.exchangeTaker ?? a.fees.dealerSpread ?? Infinity;
        const fb = b.fees.exchangeTaker ?? b.fees.dealerSpread ?? Infinity;
        return fa - fb;
      }
      case "makerFee": {
        const fa = a.fees.exchangeMaker ?? Infinity;
        const fb = b.fees.exchangeMaker ?? Infinity;
        return fa - fb;
      }
      case "tradingPairs":
        return (b.tradingPairs ?? 0) - (a.tradingPairs ?? 0);
      case "established":
        return a.established - b.established;
      default:
        return 0;
    }
  });
}

interface SectionHeaderProps {
  label: string;
  count: number;
  dotColor: string;
}
function SectionHeader({ label, count, dotColor }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
        {count}
      </span>
      <button className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
        <Plus size={11} />
      </button>
    </div>
  );
}

const REGION_OPTIONS = [
  { value: "all", label: "すべての取引所" },
  { value: "domestic", label: "国内取引所のみ" },
  { value: "overseas", label: "海外取引所のみ" },
] as const;

export default function Home() {
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [sortKey, setSortKey] = useState<SortKey>("trustScore");
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("list");
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const filtered = useMemo(() => {
    let list = exchanges;
    if (filter.region !== "all") {
      list = list.filter((ex) => ex.region === filter.region);
    }
    if (filter.fsaOnly) {
      list = list.filter((ex) => ex.fsaRegistered);
    }
    if (filter.searchText) {
      const q = filter.searchText.toLowerCase();
      list = list.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.nameEn.toLowerCase().includes(q) ||
          ex.description.includes(filter.searchText)
      );
    }
    if (filter.tokens.length > 0) {
      list = list.filter((ex) =>
        filter.tokens.every((token) => ex.tokens.includes(token as never))
      );
    }
    if (filter.features.length > 0) {
      list = list.filter((ex) =>
        filter.features.every((feature) =>
          ex.features.includes(feature as never)
        )
      );
    }
    return sortExchanges(list, sortKey);
  }, [filter, sortKey]);

  const domesticList = filtered.filter((e) => e.region === "domestic");
  const overseasList = filtered.filter((e) => e.region === "overseas");
  const showDomestic = filter.region !== "overseas";
  const showOverseas = filter.region !== "domestic";

  const handleSelect = useCallback(
    (ex: Exchange) => setSelectedExchange(ex),
    []
  );
  const handleClose = useCallback(() => setSelectedExchange(null), []);

  const currentRegionLabel =
    REGION_OPTIONS.find((o) => o.value === filter.region)?.label ??
    "すべての取引所";

  const hasFilters =
    filter.tokens.length > 0 ||
    filter.features.length > 0 ||
    filter.fsaOnly ||
    filter.searchText !== "";

  return (
    <div className="min-h-screen bg-[#D9E8F4] flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[1440px] flex overflow-hidden min-h-[92vh]">

        {/* ===== Left Sidebar ===== */}
        <aside className="w-[72px] flex-shrink-0 flex flex-col items-center py-6 gap-2.5 border-r border-gray-100 bg-white rounded-l-[2rem]">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 shadow-md shadow-blue-200">
            <BarChart3 size={18} className="text-white" />
          </div>

          {/* Nav items */}
          <button
            onClick={() => setActiveTab("list")}
            title="取引所一覧"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              activeTab === "list"
                ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            <Grid3X3 size={18} />
          </button>

          <button
            onClick={() => setActiveTab("compare")}
            title="コスト比較"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              activeTab === "compare"
                ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            <TableIcon size={18} />
          </button>

          <button
            title="手数料グラフ"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <TrendingUp size={18} />
          </button>

          <button
            title="設定"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <Settings size={18} />
          </button>

          <div className="flex-1" />

          {/* User avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer hover:scale-105 transition-transform">
            U
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F4F7FB] rounded-r-[2rem] overflow-hidden">

          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-gray-50">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {activeTab === "list" ? "取引所を探す" : "コスト比較"}
              </h1>
              {/* Region dropdown */}
              <div className="relative mt-1 inline-block">
                <button
                  onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-1"
                >
                  <span>{currentRegionLabel}</span>
                  <ChevronDown size={13} />
                </button>
                {showRegionDropdown && (
                  <div className="absolute left-0 top-full mt-1 z-30 bg-white rounded-xl border border-gray-100 shadow-lg py-1 min-w-[160px]">
                    {REGION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setFilter({ ...filter, region: opt.value });
                          setShowRegionDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          filter.region === opt.value
                            ? "text-blue-600 bg-blue-50 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="取引所を検索..."
                value={filter.searchText}
                onChange={(e) =>
                  setFilter({ ...filter, searchText: e.target.value })
                }
                className="w-full pl-9 pr-9 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400"
              />
              {filter.searchText && (
                <button
                  onClick={() => setFilter({ ...filter, searchText: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Avatar stack (decoration) */}
            <div className="flex items-center -space-x-2 flex-shrink-0">
              {[
                { bg: "from-blue-400 to-blue-600", label: "B" },
                { bg: "from-purple-400 to-purple-600", label: "P" },
                { bg: "from-green-400 to-emerald-600", label: "G" },
              ].map((av, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${av.bg} flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm`}
                >
                  {av.label}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold border-2 border-white shadow-sm">
                +{exchanges.length - 3}
              </div>
            </div>
          </div>

          {/* Filter row */}
          <CompactFilter
            filter={filter}
            sortKey={sortKey}
            onFilterChange={setFilter}
            onSortChange={setSortKey}
            resultCount={filtered.length}
          />

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-auto p-6 space-y-8"
            onClick={() => showRegionDropdown && setShowRegionDropdown(false)}
          >
            {activeTab === "list" ? (
              filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Search size={24} className="text-gray-300" />
                  </div>
                  <p className="font-medium text-gray-500">
                    条件に一致する取引所が見つかりませんでした
                  </p>
                  <p className="text-sm mt-1">フィルターを変更してみてください</p>
                  {hasFilters && (
                    <button
                      onClick={() => setFilter(defaultFilter)}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      フィルターをリセット
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* 国内セクション */}
                  {showDomestic && domesticList.length > 0 && (
                    <section>
                      <SectionHeader
                        label="国内取引所"
                        count={domesticList.length}
                        dotColor="#FF6B8A"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {domesticList.map((ex) => (
                          <ExchangeCard
                            key={ex.id}
                            exchange={ex}
                            onClick={() => handleSelect(ex)}
                            highlightTokens={filter.tokens}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 海外セクション */}
                  {showOverseas && overseasList.length > 0 && (
                    <section>
                      <SectionHeader
                        label="海外取引所"
                        count={overseasList.length}
                        dotColor="#6366F1"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {overseasList.map((ex) => (
                          <ExchangeCard
                            key={ex.id}
                            exchange={ex}
                            onClick={() => handleSelect(ex)}
                            highlightTokens={filter.tokens}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )
            ) : (
              <CostComparisonTable
                exchanges={filtered}
                onSelectExchange={handleSelect}
              />
            )}

            <footer className="text-center py-4 text-xs text-gray-400 space-y-1">
              <p>
                ※ 掲載情報は参考目的です。最新情報は各取引所の公式サイトでご確認ください。
              </p>
              <p>© 2025 CryptoExchange Finder</p>
            </footer>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedExchange && (
        <ExchangeModal exchange={selectedExchange} onClose={handleClose} />
      )}
    </div>
  );
}

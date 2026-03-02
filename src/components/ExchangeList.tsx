"use client";

import { useState, useMemo, useCallback } from "react";
import { Exchange } from "@/types/exchange";
import ExchangeCard from "@/components/ExchangeCard";
import ExchangeModal from "@/components/ExchangeModal";
import CostComparisonTable from "@/components/CostComparisonTable";
import CompactFilter, { FilterState, SortKey } from "@/components/CompactFilter";
import {
  BarChart3,
  Grid3X3,
  TableIcon,
  Search,
  X,
  ChevronDown,
  Plus,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { calcTotalScore } from "@/lib/scoreUtils";

type ActiveSection = "exchanges" | "wallets";
type ExchangeTab = "list" | "compare";

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
        return calcTotalScore(b) - calcTotalScore(a);
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
  { value: "dex", label: "DEXのみ" },
] as const;

interface ExchangeListProps {
  initialExchanges: Exchange[];
}

export default function ExchangeList({ initialExchanges }: ExchangeListProps) {
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [sortKey, setSortKey] = useState<SortKey>("trustScore");
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>("exchanges");
  const [exchangeTab, setExchangeTab] = useState<ExchangeTab>("list");
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const filtered = useMemo(() => {
    let list = initialExchanges;
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
    if (filter.features.length > 0) {
      list = list.filter((ex) =>
        filter.features.every((feature) =>
          ex.features.includes(feature as never)
        )
      );
    }
    return sortExchanges(list, sortKey);
  }, [filter, sortKey, initialExchanges]);

  const domesticList = filtered.filter((e) => e.region === "domestic");
  const overseasList = filtered.filter((e) => e.region === "overseas");
  const dexList = filtered.filter((e) => e.region === "dex");
  const showDomestic = filter.region === "all" || filter.region === "domestic";
  const showOverseas = filter.region === "all" || filter.region === "overseas";
  const showDex = filter.region === "all" || filter.region === "dex";

  const handleSelect = useCallback(
    (ex: Exchange) => setSelectedExchange(ex),
    []
  );
  const handleClose = useCallback(() => setSelectedExchange(null), []);

  const currentRegionLabel =
    REGION_OPTIONS.find((o) => o.value === filter.region)?.label ??
    "すべての取引所";

  const hasFilters =
    filter.features.length > 0 ||
    filter.searchText !== "";

  const headerTitle =
    activeSection === "wallets"
      ? "ウォレットを探す"
      : exchangeTab === "list"
      ? "取引所一覧"
      : "取引コスト比較";

  return (
    <div className="min-h-screen bg-[#D9E8F4] flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[1440px] flex overflow-hidden min-h-[92vh]">

        {/* ===== Left Sidebar ===== */}
        <aside className="w-[200px] flex-shrink-0 flex flex-col py-5 border-r border-gray-100 bg-white rounded-l-[2rem]">
          {/* ロゴ・サイト名 */}
          <div className="px-4 mb-6 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
              <BarChart3 size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 leading-none mb-0.5">暗号通貨</p>
              <p className="text-xs font-bold text-gray-800 leading-tight">取引所ガイド</p>
            </div>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 px-2 space-y-1">

            {/* 取引所を探す */}
            <div>
              <button
                onClick={() => setActiveSection("exchanges")}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                  activeSection === "exchanges"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <BarChart3 size={14} className="flex-shrink-0" />
                <span className="text-xs font-semibold">取引所を探す</span>
                <ChevronRight size={12} className={`ml-auto transition-transform ${activeSection === "exchanges" ? "rotate-90" : ""}`} />
              </button>

              {/* サブメニュー */}
              {activeSection === "exchanges" && (
                <div className="mt-1 ml-3 pl-3 border-l-2 border-blue-100 space-y-0.5">
                  <button
                    onClick={() => setExchangeTab("list")}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all ${
                      exchangeTab === "list"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    <Grid3X3 size={12} className="flex-shrink-0" />
                    <span className="text-xs font-medium">取引所一覧</span>
                  </button>
                  <button
                    onClick={() => setExchangeTab("compare")}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all ${
                      exchangeTab === "compare"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    <TableIcon size={12} className="flex-shrink-0" />
                    <span className="text-xs font-medium">取引コスト比較</span>
                  </button>
                </div>
              )}
            </div>

            {/* ウォレットを探す */}
            <button
              onClick={() => setActiveSection("wallets")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                activeSection === "wallets"
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Wallet size={14} className="flex-shrink-0" />
              <span className="text-xs font-semibold">ウォレットを探す</span>
            </button>

          </nav>

          <div className="px-4 pt-4 border-t border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer hover:scale-105 transition-transform">
              U
            </div>
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F4F7FB] rounded-r-[2rem] overflow-hidden">

          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-gray-50">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{headerTitle}</h1>
              {activeSection === "exchanges" && exchangeTab === "list" && (
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
              )}
            </div>

            {/* Search（取引所セクションのみ表示） */}
            {activeSection === "exchanges" && (
              <div className="relative w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="取引所を検索..."
                  value={filter.searchText}
                  onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
                  className="w-full pl-9 pr-9 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400"
                />
                {filter.searchText && (
                  <button onClick={() => setFilter({ ...filter, searchText: "" })} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filter row（取引所一覧のみ） */}
          {activeSection === "exchanges" && exchangeTab === "list" && (
            <CompactFilter
              filter={filter}
              sortKey={sortKey}
              onFilterChange={setFilter}
              onSortChange={setSortKey}
              resultCount={filtered.length}
            />
          )}

          {/* ===== コンテンツ ===== */}
          <div
            className="flex-1 overflow-auto p-6 space-y-8"
            onClick={() => showRegionDropdown && setShowRegionDropdown(false)}
          >

            {/* 取引所セクション */}
            {activeSection === "exchanges" && (
              <>
                {exchangeTab === "list" ? (
                  filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Search size={24} className="text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-500">条件に一致する取引所が見つかりませんでした</p>
                      <p className="text-sm mt-1">フィルターを変更してみてください</p>
                      {hasFilters && (
                        <button onClick={() => setFilter(defaultFilter)} className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors">
                          フィルターをリセット
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {showDomestic && domesticList.length > 0 && (
                        <section>
                          <SectionHeader label="国内取引所" count={domesticList.length} dotColor="#FF6B8A" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {domesticList.map((ex) => (
                              <ExchangeCard key={ex.id} exchange={ex} onClick={() => handleSelect(ex)} highlightTokens={filter.tokens} />
                            ))}
                          </div>
                        </section>
                      )}
                      {showOverseas && overseasList.length > 0 && (
                        <section>
                          <SectionHeader label="海外取引所" count={overseasList.length} dotColor="#6366F1" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {overseasList.map((ex) => (
                              <ExchangeCard key={ex.id} exchange={ex} onClick={() => handleSelect(ex)} highlightTokens={filter.tokens} />
                            ))}
                          </div>
                        </section>
                      )}
                      {showDex && dexList.length > 0 && (
                        <section>
                          <SectionHeader label="分散型取引所 (DEX)" count={dexList.length} dotColor="#10B981" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {dexList.map((ex) => (
                              <ExchangeCard key={ex.id} exchange={ex} onClick={() => handleSelect(ex)} highlightTokens={filter.tokens} />
                            ))}
                          </div>
                        </section>
                      )}
                    </>
                  )
                ) : (
                  <CostComparisonTable exchanges={filtered} onSelectExchange={handleSelect} />
                )}
              </>
            )}

            {/* ウォレットセクション（準備中） */}
            {activeSection === "wallets" && (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mb-5">
                  <Wallet size={32} className="text-purple-300" />
                </div>
                <p className="font-bold text-gray-600 text-lg mb-2">ウォレットガイド</p>
                <p className="text-sm text-gray-400 mb-1">ハードウェア・ソフトウェア・ブラウザ拡張など</p>
                <p className="text-sm text-gray-400">各種ウォレットの比較・解説ページを準備中です。</p>
                <span className="mt-5 px-4 py-1.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full">Coming Soon</span>
              </div>
            )}

            <footer className="text-center py-4 text-xs text-gray-400 space-y-1">
              <p>※ 掲載情報は参考目的です。最新情報は各取引所の公式サイトでご確認ください。</p>
              <p>© 2025 暗号通貨取引所ガイド</p>
            </footer>
          </div>
        </div>
      </div>

      {selectedExchange && (
        <ExchangeModal exchange={selectedExchange} onClose={handleClose} />
      )}
    </div>
  );
}

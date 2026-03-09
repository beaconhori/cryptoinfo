"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Exchange } from "@/types/exchange";
import { Wallet } from "@/types/wallet";
import ExchangeCard from "@/components/ExchangeCard";
import ExchangeModal from "@/components/ExchangeModal";
import CostComparisonTable from "@/components/CostComparisonTable";
import CompactFilter, { FilterState, SortKey } from "@/components/CompactFilter";
import WalletSection from "@/components/WalletSection";
import Fa from "@/components/Fa";
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
  const travelRuleOrder: Record<string, number> = {
    "TRUST": 1,
    "Sygna+TRUST": 2,
    "Sygna": 3,
    "独自対応": 4,
    "不明": 5,
    "N/A": 6,
  };

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
      case "travelRule": {
        const ra = travelRuleOrder[a.travelRule?.solution ?? "不明"] ?? 5;
        const rb = travelRuleOrder[b.travelRule?.solution ?? "不明"] ?? 5;
        return ra - rb;
      }
      default:
        return 0;
    }
  });
}

interface SectionHeaderProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}
function SectionHeader({ label, count, icon, color }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="flex-shrink-0" style={{ color }}>{icon}</span>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{count}</span>
    </div>
  );
}

const REGION_ICONS = {
  all: null,
  domestic: <Fa icon="circle-dot" variant="regular" sharp size={12} />,
  overseas: <Fa icon="globe" size={12} />,
  dex: <Fa icon="bolt" size={12} />,
} as const;

const REGION_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "domestic", label: "国内" },
  { value: "overseas", label: "海外" },
  { value: "dex", label: "DEX" },
] as const;

interface ExchangeListProps {
  initialExchanges: Exchange[];
  initialWallets: Wallet[];
}

export default function ExchangeList({ initialExchanges, initialWallets }: ExchangeListProps) {
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [sortKey, setSortKey] = useState<SortKey>("trustScore");
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>("exchanges");
  const [exchangeTab, setExchangeTab] = useState<ExchangeTab>("list");

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
        filter.features.every((feature) => ex.features.includes(feature as never))
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

  const handleSelect = useCallback((ex: Exchange) => setSelectedExchange(ex), []);
  const handleClose = useCallback(() => setSelectedExchange(null), []);

  const hasFilters = filter.features.length > 0 || filter.searchText !== "";

  const headerTitle =
    activeSection === "wallets"
      ? "ウォレットを探す"
      : exchangeTab === "list"
      ? "取引所一覧"
      : "取引コスト比較";

  return (
    <div className="min-h-screen bg-[#D9E8F4] flex flex-col items-center justify-start md:justify-center p-0 md:p-8 md:gap-4">

      {/* ===== ページタイトル（枠外・デスクトップのみ） ===== */}
      <div className="hidden md:block w-full max-w-[1440px] px-2">
        <p className="text-xs font-semibold text-[#1E3A8A] tracking-widest uppercase opacity-70">暗号通貨</p>
        <h1 className="text-2xl font-extrabold text-[#1E3A8A] leading-tight">取引所ガイド</h1>
      </div>

      {/* ===== モバイルトップバー ===== */}
      <div className="md:hidden w-full bg-[#1E3A8A] px-4 pt-safe-top pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-blue-300 font-semibold tracking-widest uppercase">暗号通貨</p>
          <p className="text-lg font-extrabold text-white leading-tight">取引所ガイド</p>
        </div>
        {activeSection === "exchanges" && (
          <div className="relative">
            <Fa icon="magnifying-glass" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="検索..."
              value={filter.searchText}
              onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
              className="pl-8 pr-7 py-1.5 bg-white/10 text-white placeholder-blue-300 rounded-full text-sm focus:outline-none focus:bg-white/20 transition-all w-36"
            />
            {filter.searchText && (
              <button onClick={() => setFilter({ ...filter, searchText: "" })} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <Fa icon="xmark" size={12} className="text-blue-300" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ===== メインカード ===== */}
      <div className="bg-white md:rounded-[2rem] shadow-2xl w-full max-w-[1440px] flex overflow-hidden min-h-screen md:min-h-[92vh]">

        {/* ===== Left Sidebar（デスクトップのみ） ===== */}
        <aside className="hidden md:flex w-[200px] flex-shrink-0 flex-col py-5 border-r border-gray-100 bg-white rounded-l-[2rem]">
          <nav className="flex-1 px-2 space-y-1">
            {/* 取引所を探す */}
            <div>
              <button
                onClick={() => setActiveSection("exchanges")}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                  activeSection === "exchanges" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <Fa icon="chart-candlestick" variant="light" size={13} className="flex-shrink-0" />
                <span className="text-xs font-semibold">取引所を探す</span>
                <Fa icon="chevron-right" size={11} className={`ml-auto transition-transform ${activeSection === "exchanges" ? "rotate-90" : ""}`} />
              </button>
              {activeSection === "exchanges" && (
                <div className="mt-1 ml-3 pl-3 border-l-2 border-blue-100 space-y-0.5">
                  <button
                    onClick={() => setExchangeTab("list")}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all ${
                      exchangeTab === "list" ? "bg-blue-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    <Fa icon="buildings" variant="regular" size={11} className="flex-shrink-0" />
                    <span className="text-xs font-medium">取引所一覧</span>
                  </button>
                  <button
                    onClick={() => setExchangeTab("compare")}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all ${
                      exchangeTab === "compare" ? "bg-blue-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    <Fa icon="circle-yen" variant="light" size={11} className="flex-shrink-0" />
                    <span className="text-xs font-medium">取引コスト比較</span>
                  </button>
                </div>
              )}
            </div>
            {/* ウォレットを探す */}
            <button
              onClick={() => setActiveSection("wallets")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                activeSection === "wallets" ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Fa icon="wallet" size={13} className="flex-shrink-0" />
              <span className="text-xs font-semibold">ウォレットを探す</span>
            </button>
            {/* 記事・ガイド */}
            <Link
              href="/blog"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              <Fa icon="book-open" size={13} className="flex-shrink-0" />
              <span className="text-xs font-semibold">記事・ガイド</span>
            </Link>
          </nav>

          <div className="px-4 pt-4 border-t border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer hover:scale-105 transition-transform">
              U
            </div>
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F4F7FB] md:rounded-r-[2rem] overflow-hidden">

          {/* デスクトップ用ヘッダー */}
          <div className="hidden md:flex bg-white px-6 py-4 items-center gap-4 border-b border-gray-50">
            <div className="flex-1 min-w-0 flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight flex-shrink-0">{headerTitle}</h2>
              {activeSection === "exchanges" && exchangeTab === "list" && (
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {REGION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilter({ ...filter, region: opt.value })}
                      className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filter.region === opt.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {REGION_ICONS[opt.value]}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {activeSection === "exchanges" && (
              <div className="relative w-64">
                <Fa icon="magnifying-glass" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="取引所を検索..."
                  value={filter.searchText}
                  onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
                  className="w-full pl-9 pr-9 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400"
                />
                {filter.searchText && (
                  <button onClick={() => setFilter({ ...filter, searchText: "" })} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Fa icon="xmark" size={14} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* モバイル用タブバー（ページ内上部） */}
          {activeSection === "exchanges" && (
            <div className="md:hidden bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 flex-1">
                {REGION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter({ ...filter, region: opt.value })}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filter.region === opt.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {REGION_ICONS[opt.value]}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
          <div className="flex-1 overflow-auto p-3 md:p-6 space-y-6 md:space-y-8 pb-20 md:pb-6">

            {/* 取引所セクション */}
            {activeSection === "exchanges" && (
              <>
                {exchangeTab === "list" ? (
                  filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Fa icon="magnifying-glass" size={24} className="text-gray-300" />
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
                          <SectionHeader label="国内取引所" count={domesticList.length} icon={<Fa icon="circle-dot" variant="regular" sharp size={15} />} color="#F43F5E" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {domesticList.map((ex) => (
                              <ExchangeCard key={ex.id} exchange={ex} onClick={() => handleSelect(ex)} highlightTokens={filter.tokens} />
                            ))}
                          </div>
                        </section>
                      )}
                      {showOverseas && overseasList.length > 0 && (
                        <section>
                          <SectionHeader label="海外取引所" count={overseasList.length} icon={<Fa icon="globe" size={15} />} color="#6366F1" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {overseasList.map((ex) => (
                              <ExchangeCard key={ex.id} exchange={ex} onClick={() => handleSelect(ex)} highlightTokens={filter.tokens} />
                            ))}
                          </div>
                        </section>
                      )}
                      {showDex && dexList.length > 0 && (
                        <section>
                          <SectionHeader label="分散型取引所 (DEX)" count={dexList.length} icon={<Fa icon="bolt" size={15} />} color="#10B981" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
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

            {/* ウォレットセクション */}
            {activeSection === "wallets" && (
              <WalletSection wallets={initialWallets} />
            )}

            <footer className="text-center py-4 text-xs text-gray-400 space-y-1">
              <p>※ 掲載情報は参考目的です。最新情報は各取引所の公式サイトでご確認ください。</p>
              <p>© 2025 暗号通貨取引所ガイド</p>
            </footer>
          </div>
        </div>
      </div>

      {/* ===== モバイル用ボトムナビゲーション ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-stretch z-40 shadow-lg">
        <button
          onClick={() => { setActiveSection("exchanges"); setExchangeTab("list"); }}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
            activeSection === "exchanges" && exchangeTab === "list" ? "text-blue-600" : "text-gray-400"
          }`}
        >
          <Fa icon="buildings" variant="regular" size={20} />
          <span className="text-[10px] font-medium">取引所一覧</span>
        </button>
        <button
          onClick={() => { setActiveSection("exchanges"); setExchangeTab("compare"); }}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
            activeSection === "exchanges" && exchangeTab === "compare" ? "text-blue-600" : "text-gray-400"
          }`}
        >
          <Fa icon="circle-yen" variant="light" size={20} />
          <span className="text-[10px] font-medium">コスト比較</span>
        </button>
        <button
          onClick={() => setActiveSection("wallets")}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
            activeSection === "wallets" ? "text-purple-600" : "text-gray-400"
          }`}
        >
          <Fa icon="wallet" size={20} />
          <span className="text-[10px] font-medium">ウォレット</span>
        </button>
        <Link
          href="/blog"
          className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors text-gray-400 hover:text-green-600"
        >
          <Fa icon="book-open" size={20} />
          <span className="text-[10px] font-medium">記事</span>
        </Link>
      </nav>

      {selectedExchange && (
        <ExchangeModal exchange={selectedExchange} onClose={handleClose} />
      )}
    </div>
  );
}

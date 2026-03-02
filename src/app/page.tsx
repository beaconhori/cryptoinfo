"use client";

import { useState, useMemo, useCallback } from "react";
import { exchanges } from "@/data/exchanges";
import { Exchange } from "@/types/exchange";
import ExchangeCard from "@/components/ExchangeCard";
import ExchangeModal from "@/components/ExchangeModal";
import CostComparisonTable from "@/components/CostComparisonTable";
import FilterBar, { FilterState, SortKey } from "@/components/FilterBar";
import { BarChart3, Grid3X3, TableIcon } from "lucide-react";

type ViewMode = "grid" | "table";

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
        const fa =
          a.fees.exchangeTaker ?? a.fees.dealerSpread ?? Infinity;
        const fb =
          b.fees.exchangeTaker ?? b.fees.dealerSpread ?? Infinity;
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

export default function Home() {
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [sortKey, setSortKey] = useState<SortKey>("trustScore");
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<"list" | "compare">("list");

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

  const handleFilterChange = useCallback((f: FilterState) => setFilter(f), []);
  const handleSortChange = useCallback((k: SortKey) => setSortKey(k), []);
  const handleSelectExchange = useCallback((ex: Exchange) => setSelectedExchange(ex), []);
  const handleCloseModal = useCallback(() => setSelectedExchange(null), []);

  const stats = useMemo(() => {
    const domestic = exchanges.filter((e) => e.region === "domestic").length;
    const overseas = exchanges.filter((e) => e.region === "overseas").length;
    const fsaCount = exchanges.filter((e) => e.fsaRegistered).length;
    return { domestic, overseas, fsaCount, total: exchanges.length };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight">
                CryptoExchange Finder
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                仮想通貨取引所 比較・検索
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">
              国内 {stats.domestic} · 海外 {stats.overseas} · 計 {stats.total} 取引所
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ヒーローセクション */}
        <div className="text-center py-8 px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            あなたに最適な<br className="sm:hidden" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              仮想通貨取引所
            </span>
            を見つけよう
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            国内・海外{stats.total}取引所を手数料・機能・対応銘柄で比較。
            取引コストを一目で確認できます。
          </p>
          {/* サマリーバッジ */}
          <div className="flex justify-center gap-4 mt-5">
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.domestic}</p>
              <p className="text-xs text-gray-500">国内取引所</p>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.overseas}</p>
              <p className="text-xs text-gray-500">海外取引所</p>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.fsaCount}</p>
              <p className="text-xs text-gray-500">金融庁登録</p>
            </div>
          </div>
        </div>

        {/* フィルターバー */}
        <FilterBar
          filter={filter}
          sortKey={sortKey}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          resultCount={filtered.length}
        />

        {/* タブ */}
        <div className="flex items-center justify-between">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "list"
                  ? "bg-indigo-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid3X3 size={14} />
              取引所一覧
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "compare"
                  ? "bg-indigo-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <TableIcon size={14} />
              コスト比較
            </button>
          </div>

          {activeTab === "list" && (
            <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-indigo-500 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Grid3X3 size={14} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-indigo-500 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <TableIcon size={14} />
              </button>
            </div>
          )}
        </div>

        {/* コンテンツ */}
        {activeTab === "list" ? (
          filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">条件に一致する取引所が見つかりませんでした</p>
              <p className="text-sm mt-1">フィルターを変更してみてください</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((exchange) => (
                <ExchangeCard
                  key={exchange.id}
                  exchange={exchange}
                  onClick={() => handleSelectExchange(exchange)}
                  highlightTokens={filter.tokens}
                />
              ))}
            </div>
          ) : (
            /* テーブルビュー */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-medium">取引所</th>
                      <th className="text-center py-3 px-3 font-medium">地域</th>
                      <th className="text-center py-3 px-3 font-medium">金融庁</th>
                      <th className="text-center py-3 px-3 font-medium">Maker</th>
                      <th className="text-center py-3 px-3 font-medium">Taker</th>
                      <th className="text-center py-3 px-3 font-medium">スプレッド</th>
                      <th className="text-center py-3 px-3 font-medium">取引ペア</th>
                      <th className="text-center py-3 px-3 font-medium">信頼度</th>
                      <th className="text-left py-3 px-4 font-medium">主な機能</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((ex) => (
                      <tr
                        key={ex.id}
                        onClick={() => handleSelectExchange(ex)}
                        className="hover:bg-indigo-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: ex.logoColor }}
                            >
                              {ex.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-800">{ex.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              ex.region === "domestic"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {ex.region === "domestic" ? "国内" : "海外"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {ex.fsaRegistered ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-gray-200">—</span>
                          )}
                        </td>
                        <td className={`py-3 px-3 text-center font-medium ${
                          ex.fees.exchangeMaker !== undefined && ex.fees.exchangeMaker < 0
                            ? "text-green-600"
                            : "text-gray-700"
                        }`}>
                          {ex.fees.exchangeMaker !== undefined
                            ? `${ex.fees.exchangeMaker.toFixed(2)}%`
                            : "—"}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-gray-700">
                          {ex.fees.exchangeTaker !== undefined
                            ? `${ex.fees.exchangeTaker.toFixed(2)}%`
                            : "—"}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-orange-600">
                          {ex.fees.dealerSpread !== undefined
                            ? `${ex.fees.dealerSpread.toFixed(1)}%`
                            : "—"}
                        </td>
                        <td className="py-3 px-3 text-center text-gray-600">
                          {ex.tradingPairs?.toLocaleString() ?? "—"}
                        </td>
                        <td className="py-3 px-3 text-center text-yellow-500 text-xs">
                          {"★".repeat(ex.trustScore)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {ex.features.slice(0, 3).map((f) => (
                              <span
                                key={f}
                                className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded"
                              >
                                {f === "spot"
                                  ? "現物"
                                  : f === "futures"
                                  ? "先物"
                                  : f === "margin"
                                  ? "証拠金"
                                  : f === "staking"
                                  ? "ステーキング"
                                  : f === "copy_trading"
                                  ? "コピー"
                                  : f}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <CostComparisonTable
            exchanges={filtered}
            onSelectExchange={handleSelectExchange}
          />
        )}

        {/* フッター */}
        <footer className="text-center py-8 text-xs text-gray-400 space-y-1">
          <p>※ 掲載情報は参考目的です。最新情報は各取引所の公式サイトでご確認ください。</p>
          <p>© 2025 CryptoExchange Finder</p>
        </footer>
      </main>

      {/* モーダル */}
      {selectedExchange && (
        <ExchangeModal exchange={selectedExchange} onClose={handleCloseModal} />
      )}
    </div>
  );
}

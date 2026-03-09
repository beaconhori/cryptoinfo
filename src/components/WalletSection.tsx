"use client";

import { useState, useMemo } from "react";
import { Wallet, WalletType } from "@/types/wallet";
import WalletCard from "@/components/WalletCard";
import WalletModal from "@/components/WalletModal";
import Fa from "@/components/Fa";

const TYPE_TABS: { value: WalletType | "all"; label: string; icon: string }[] = [
  { value: "all",               label: "すべて",         icon: "grid-2" },
  { value: "smart_account",     label: "スマート",        icon: "wand-magic-sparkles" },
  { value: "browser_extension", label: "ブラウザ拡張",    icon: "browser" },
  { value: "mobile",            label: "モバイル",        icon: "mobile" },
  { value: "software",          label: "デスクトップ",    icon: "desktop" },
  { value: "hardware",          label: "ハードウェア",    icon: "microchip" },
];

interface WalletSectionProps {
  wallets: Wallet[];
}

export default function WalletSection({ wallets }: WalletSectionProps) {
  const [typeFilter, setTypeFilter] = useState<WalletType | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  const filtered = useMemo(() => {
    let list = wallets;
    if (typeFilter !== "all") {
      list = list.filter((w) => w.type === typeFilter);
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.nameEn.toLowerCase().includes(q) ||
          w.description.includes(searchText)
      );
    }
    return list;
  }, [wallets, typeFilter, searchText]);

  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mb-5">
          <Fa icon="wallet" size={32} className="text-purple-300" />
        </div>
        <p className="font-bold text-gray-600 text-lg mb-2">ウォレットガイド</p>
        <p className="text-sm text-gray-400 mb-1">ブラウザ拡張・モバイル・デスクトップなど</p>
        <p className="text-sm text-gray-400">各種ウォレットの比較・解説ページを準備中です。</p>
        <span className="mt-5 px-4 py-1.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full">Coming Soon</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* フィルターバー */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* タイプタブ */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === tab.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Fa icon={tab.icon} variant="light" size={11} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 検索 */}
        <div className="relative sm:ml-auto sm:w-56">
          <Fa icon="magnifying-glass" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ウォレットを検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-gray-100 rounded-full text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 transition-all placeholder-gray-400"
          />
          {searchText && (
            <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <Fa icon="xmark" size={12} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* 結果 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Fa icon="magnifying-glass" size={32} className="text-gray-200 mb-4" />
          <p className="font-medium text-gray-500">条件に一致するウォレットが見つかりませんでした</p>
          <button
            onClick={() => { setTypeFilter("all"); setSearchText(""); }}
            className="mt-4 px-4 py-2 bg-purple-500 text-white text-sm rounded-xl hover:bg-purple-600 transition-colors"
          >
            フィルターをリセット
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 px-1">
            <Fa icon="wallet" size={13} className="text-purple-500" />
            <span className="text-sm font-semibold text-gray-700">ウォレット一覧</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{filtered.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((w) => (
              <WalletCard key={w.id} wallet={w} onClick={() => setSelectedWallet(w)} />
            ))}
          </div>
        </>
      )}

      {selectedWallet && (
        <WalletModal wallet={selectedWallet} onClose={() => setSelectedWallet(null)} />
      )}
    </div>
  );
}

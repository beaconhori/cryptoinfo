"use client";

import { useState } from "react";
import { Exchange } from "@/types/exchange";
import { TrendingUp, ChevronUp, ChevronDown, AlertTriangle, BookOpen, Store, Zap } from "lucide-react";
import { getSpreadConfig } from "@/lib/spreadUtils";

interface CostComparisonTableProps {
  exchanges: Exchange[];
  onSelectExchange: (exchange: Exchange) => void;
}

const TRADE_AMOUNTS = [10000, 100000, 1000000];

type TabMode = "exchange" | "dealer" | "dex";

function RegionBadge({ region }: { region: string }) {
  if (region === "domestic")
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-pink-50 text-pink-600 flex items-center gap-1 w-fit">🇯🇵 国内</span>;
  if (region === "dex")
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-600">⚡ DEX</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-600">🌐 海外</span>;
}

function RankBadge({ rank, cost }: { rank: number; cost: number | null }) {
  if (cost === null) return null;
  if (rank === 0) return <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-md font-bold flex-shrink-0">最安</span>;
  if (rank === 1) return <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-md font-bold flex-shrink-0">2位</span>;
  if (rank === 2) return <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-bold flex-shrink-0">3位</span>;
  return null;
}

export default function CostComparisonTable({
  exchanges,
  onSelectExchange,
}: CostComparisonTableProps) {
  const [selectedAmount, setSelectedAmount] = useState(100000);
  const [tab, setTab] = useState<TabMode>("exchange");
  const [makerMode, setMakerMode] = useState(false);

  // タブごとに対象取引所を絞る
  const exchangeList = exchanges.filter((e) => e.fees.exchangeTaker !== undefined || e.fees.exchangeMaker !== undefined).filter((e) => e.region !== "dex");
  const dealerList = exchanges.filter((e) => e.fees.dealerSpread !== undefined);
  const dexList = exchanges.filter((e) => e.region === "dex");

  // 取引所タブ用コスト計算
  const exchangeSorted = [...exchangeList]
    .map((ex) => {
      const rate = makerMode ? ex.fees.exchangeMaker : ex.fees.exchangeTaker;
      const cost = rate !== undefined ? selectedAmount * (rate / 100) : null;
      return { ex, rate, cost };
    })
    .sort((a, b) => {
      if (a.cost === null) return 1;
      if (b.cost === null) return -1;
      return a.cost - b.cost;
    });

  // 販売所タブ用コスト計算（スプレッド = 往復コスト）
  const dealerSorted = [...dealerList]
    .map((ex) => {
      const spread = ex.fees.dealerSpread!;
      const lossCost = (selectedAmount * spread) / 100;
      return { ex, spread, lossCost };
    })
    .sort((a, b) => a.lossCost - b.lossCost);

  // DEXタブ用コスト計算
  const dexSorted = [...dexList]
    .map((ex) => {
      const rate = makerMode ? ex.fees.exchangeMaker : ex.fees.exchangeTaker;
      const cost = rate !== undefined ? selectedAmount * (rate / 100) : null;
      return { ex, rate, cost };
    })
    .sort((a, b) => {
      if (a.cost === null) return 1;
      if (b.cost === null) return -1;
      return a.cost - b.cost;
    });

  const exchangeValidCosts = exchangeSorted.map((r) => r.cost).filter((c): c is number => c !== null && c >= 0);
  const dexValidCosts = dexSorted.map((r) => r.cost).filter((c): c is number => c !== null && c >= 0);
  const dealerValidCosts = dealerSorted.map((r) => r.lossCost);

  const exMin = Math.min(...exchangeValidCosts);
  const exMax = Math.max(...exchangeValidCosts);
  const dexMin = Math.min(...dexValidCosts);
  const dealerMin = Math.min(...dealerValidCosts);
  const dealerMax = Math.max(...dealerValidCosts);

  const tabConfig = {
    exchange: { label: "取引所", icon: <BookOpen size={13} />, count: exchangeList.length, color: "emerald" },
    dealer: { label: "販売所", icon: <Store size={13} />, count: dealerList.length, color: "amber" },
    dex: { label: "DEX（オンチェーン）", icon: <Zap size={13} />, count: dexList.length, color: "teal" },
  } as const;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">取引コスト比較</h2>
            <p className="text-xs text-gray-400">行をクリックで詳細を表示</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* 金額切替 */}
          <div className="flex rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            {TRADE_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedAmount === amount
                    ? "bg-blue-500 text-white rounded-xl shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {(amount / 10000).toLocaleString()}万円
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {(["exchange", "dealer", "dex"] as TabMode[]).map((t) => {
          const cfg = tabConfig[t];
          const isActive = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
                isActive
                  ? "border-blue-500 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {cfg.icon}
              {cfg.label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${isActive ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
                {cfg.count}
              </span>
            </button>
          );
        })}

        {/* Maker/Taker toggle（取引所・DEXタブのみ） */}
        {(tab === "exchange" || tab === "dex") && (
          <div className="ml-auto mr-4 flex items-center">
            <div className="flex rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
              <button
                onClick={() => setMakerMode(false)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${!makerMode ? "bg-white text-gray-800 rounded-xl shadow-sm" : "text-gray-400"}`}
              >
                Taker
              </button>
              <button
                onClick={() => setMakerMode(true)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${makerMode ? "bg-white text-gray-800 rounded-xl shadow-sm" : "text-gray-400"}`}
              >
                Maker
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== 取引所タブ ===== */}
      {tab === "exchange" && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70 text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left py-3 px-5 font-medium">取引所名</th>
                  <th className="text-center py-3 px-3 font-medium">地域</th>
                  <th className="text-center py-3 px-3 font-medium">{makerMode ? "Maker" : "Taker"} 手数料率</th>
                  <th className="text-center py-3 px-3 font-medium">{selectedAmount.toLocaleString()}円の{makerMode ? "Maker" : "Taker"}手数料</th>
                  <th className="text-center py-3 px-3 font-medium">往復コスト目安<span className="text-gray-300 ml-1 font-normal">(買→即売)</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exchangeSorted.map(({ ex, rate, cost }, i) => {
                  const isRebate = (rate ?? 0) < 0;
                  const isLowest = cost !== null && cost >= 0 && cost === exMin;
                  const isHighest = cost !== null && cost === exMax && exMax > exMin;
                  const { roundTripCostPct } = ex.fees;
                  const cfg = getSpreadConfig(ex.fees.spreadRating);
                  const rankIdx = exchangeSorted.findIndex(r => r.cost !== null && r.cost >= 0) === i ? 0
                    : exchangeSorted.filter(r => r.cost !== null && r.cost >= 0).indexOf({ ex, rate, cost }) ;
                  const positiveIdx = exchangeSorted.filter(r => r.cost !== null && r.cost >= 0).findIndex(r => r.ex.id === ex.id);

                  return (
                    <tr key={ex.id} onClick={() => onSelectExchange(ex)} className="cursor-pointer hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <RankBadge rank={positiveIdx} cost={cost} />
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm" style={{ backgroundColor: ex.logoColor }}>
                            {ex.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{ex.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center"><RegionBadge region={ex.region} /></td>
                      <td className={`py-3 px-3 text-center text-sm font-bold ${isRebate ? "text-emerald-600" : "text-gray-700"}`}>
                        {rate !== undefined ? `${rate >= 0 ? "" : ""}${rate.toFixed(3)}%` : "—"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {cost !== null ? (
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-sm font-medium ${
                            isRebate ? "text-emerald-600" : isLowest ? "text-blue-700 bg-blue-50" : isHighest ? "text-rose-500 bg-rose-50" : "text-gray-600"
                          }`}>
                            {isLowest && !isRebate && <ChevronDown size={12} className="text-blue-400" />}
                            {isHighest && <ChevronUp size={12} className="text-rose-400" />}
                            {isRebate ? "-" : ""}{Math.abs(cost).toLocaleString()}円
                          </span>
                        ) : <span className="text-gray-300 text-sm">—</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs font-bold" style={{ color: cfg.color }}>
                            {((selectedAmount * roundTripCostPct) / 100).toLocaleString()}円
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                            {cfg.label} ({roundTripCostPct.toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50">
            <p className="text-xs text-gray-400">※ 取引所形式（板取引）の手数料比較です。往復コスト＝Taker×2＋板スプレッド目安。</p>
          </div>
        </>
      )}

      {/* ===== 販売所タブ ===== */}
      {tab === "dealer" && (
        <>
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
            <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              販売所はスプレッド（売値と買値の差）がコストです。手数料0円でもスプレッドが広いと実質コストは高くなります。<strong>往復コスト（買って即売った場合の損失）</strong>で比較してください。
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70 text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left py-3 px-5 font-medium">取引所名</th>
                  <th className="text-center py-3 px-3 font-medium">地域</th>
                  <th className="text-center py-3 px-3 font-medium">スプレッド目安<span className="text-gray-300 ml-1 font-normal">＝往復コスト率</span></th>
                  <th className="text-center py-3 px-3 font-medium">{selectedAmount.toLocaleString()}円の損失額目安<span className="text-gray-300 ml-1 font-normal">(買→即売)</span></th>
                  <th className="text-center py-3 px-3 font-medium">評価</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dealerSorted.map(({ ex, spread, lossCost }, i) => {
                  const cfg = getSpreadConfig(ex.fees.spreadRating);
                  const isLowest = lossCost === dealerMin;
                  const isHighest = lossCost === dealerMax && dealerMax > dealerMin;
                  const isAlert = ex.fees.spreadRating === "wide" || ex.fees.spreadRating === "very_wide";
                  const positiveIdx = dealerSorted.findIndex(r => r.ex.id === ex.id);

                  return (
                    <tr key={ex.id} onClick={() => onSelectExchange(ex)} className="cursor-pointer hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <RankBadge rank={positiveIdx} cost={lossCost} />
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm" style={{ backgroundColor: ex.logoColor }}>
                            {ex.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{ex.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center"><RegionBadge region={ex.region} /></td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-bold" style={{ color: cfg.color }}>≈ {spread.toFixed(1)}%</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-sm font-bold ${
                          isLowest ? "text-blue-700 bg-blue-50" : isHighest ? "text-rose-600 bg-rose-50" : ""
                        }`} style={!isLowest && !isHighest ? { color: cfg.color } : {}}>
                          {isLowest && <ChevronDown size={12} className="text-blue-400" />}
                          {isHighest && <ChevronUp size={12} className="text-rose-400" />}
                          {isAlert && !isHighest && <AlertTriangle size={11} />}
                          {lossCost.toLocaleString()}円
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50">
            <p className="text-xs text-gray-400">※ 販売所スプレッドは目安です。銘柄・時間帯・市況により大きく変動します。実際の取引前に必ず確認してください。</p>
          </div>
        </>
      )}

      {/* ===== DEXタブ ===== */}
      {tab === "dex" && (
        <>
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-start gap-2">
            <Zap size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700">
              DEXはノンカストディアル（自己管理）でKYC不要。手数料に加えてガス代・ブリッジコストが発生します。法定通貨（円）での直接入出金はできません。
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70 text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left py-3 px-5 font-medium">DEX名</th>
                  <th className="text-center py-3 px-3 font-medium">基盤チェーン</th>
                  <th className="text-center py-3 px-3 font-medium">{makerMode ? "Maker" : "Taker"} 手数料率</th>
                  <th className="text-center py-3 px-3 font-medium">{selectedAmount.toLocaleString()}円の手数料</th>
                  <th className="text-center py-3 px-3 font-medium">往復コスト目安</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dexSorted.map(({ ex, rate, cost }, i) => {
                  const isRebate = (rate ?? 0) < 0;
                  const isLowest = cost !== null && cost >= 0 && cost === dexMin;
                  const { roundTripCostPct } = ex.fees;
                  const cfg = getSpreadConfig(ex.fees.spreadRating);
                  const positiveIdx = dexSorted.filter(r => r.cost !== null && r.cost >= 0).findIndex(r => r.ex.id === ex.id);
                  const chain = ex.country.replace("分散型（", "").replace("）", "");

                  return (
                    <tr key={ex.id} onClick={() => onSelectExchange(ex)} className="cursor-pointer hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <RankBadge rank={positiveIdx} cost={cost} />
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm" style={{ backgroundColor: ex.logoColor }}>
                            {ex.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{ex.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{chain}</span>
                      </td>
                      <td className={`py-3 px-3 text-center text-sm font-bold ${isRebate ? "text-emerald-600" : "text-gray-700"}`}>
                        {rate !== undefined ? `${rate.toFixed(3)}%` : "—"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {cost !== null ? (
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-sm font-medium ${
                            isRebate ? "text-emerald-600" : isLowest ? "text-blue-700 bg-blue-50" : "text-gray-600"
                          }`}>
                            {isLowest && !isRebate && <ChevronDown size={12} className="text-blue-400" />}
                            {isRebate ? "-" : ""}{Math.abs(cost).toLocaleString()}円
                          </span>
                        ) : <span className="text-gray-300 text-sm">—</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs font-bold" style={{ color: cfg.color }}>
                            {((selectedAmount * roundTripCostPct) / 100).toLocaleString()}円
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                            {cfg.label} ({roundTripCostPct.toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50">
            <p className="text-xs text-gray-400">※ ガス代・ブリッジ手数料は含まれていません。実際のコストは使用するチェーンや混雑状況により異なります。</p>
          </div>
        </>
      )}
    </div>
  );
}

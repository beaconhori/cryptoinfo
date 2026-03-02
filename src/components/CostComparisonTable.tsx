"use client";

import { useState } from "react";
import { Exchange } from "@/types/exchange";
import { TrendingUp, ChevronUp, ChevronDown } from "lucide-react";

interface CostComparisonTableProps {
  exchanges: Exchange[];
  onSelectExchange: (exchange: Exchange) => void;
}

const TRADE_AMOUNTS = [10000, 100000, 1000000];

function calcTakerCost(exchange: Exchange, amount: number): number | null {
  const { fees } = exchange;
  if (fees.exchangeTaker !== undefined) return amount * (fees.exchangeTaker / 100);
  if (fees.dealerSpread !== undefined) return amount * (fees.dealerSpread / 100);
  return null;
}

function calcMakerCost(exchange: Exchange, amount: number): number | null {
  const { fees } = exchange;
  if (fees.exchangeMaker !== undefined) return amount * (fees.exchangeMaker / 100);
  return null;
}

function CostCell({
  value,
  isLowest,
  isHighest,
  isRebate,
}: {
  value: number | null;
  isLowest: boolean;
  isHighest: boolean;
  isRebate: boolean;
}) {
  if (value === null)
    return <td className="py-3 px-3 text-center text-gray-300 text-sm">—</td>;

  return (
    <td
      className={`py-3 px-3 text-center text-sm font-medium ${
        isRebate
          ? "text-emerald-600"
          : isLowest
          ? "text-blue-700"
          : isHighest
          ? "text-rose-500"
          : "text-gray-600"
      }`}
    >
      <span
        className={`inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-lg ${
          isLowest && !isRebate ? "bg-blue-50" : isHighest ? "bg-rose-50" : ""
        }`}
      >
        {isLowest && !isRebate && <ChevronDown size={12} className="text-blue-400" />}
        {isHighest && <ChevronUp size={12} className="text-rose-400" />}
        {isRebate ? "-" : ""}
        {Math.abs(value).toLocaleString()}円
      </span>
    </td>
  );
}

export default function CostComparisonTable({
  exchanges,
  onSelectExchange,
}: CostComparisonTableProps) {
  const [selectedAmount, setSelectedAmount] = useState(100000);
  const [mode, setMode] = useState<"taker" | "maker">("taker");

  const costs = exchanges.map((ex) => ({
    exchange: ex,
    cost:
      mode === "taker"
        ? calcTakerCost(ex, selectedAmount)
        : calcMakerCost(ex, selectedAmount),
  }));

  const validCosts = costs
    .filter((c) => c.cost !== null)
    .map((c) => c.cost as number);
  const minCost = Math.min(...validCosts.filter((c) => c >= 0));
  const maxCost = Math.max(...validCosts);

  const sorted = [...costs].sort((a, b) => {
    if (a.cost === null) return 1;
    if (b.cost === null) return -1;
    return a.cost - b.cost;
  });

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
          <div className="flex rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            <button
              onClick={() => setMode("taker")}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${
                mode === "taker"
                  ? "bg-blue-500 text-white rounded-xl shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Taker / 販売所
            </button>
            <button
              onClick={() => setMode("maker")}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${
                mode === "maker"
                  ? "bg-blue-500 text-white rounded-xl shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Maker
            </button>
          </div>
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/70 text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left py-3 px-5 font-medium">取引所</th>
              <th className="text-center py-3 px-3 font-medium">地域</th>
              <th className="text-center py-3 px-3 font-medium">手数料率</th>
              <th className="text-center py-3 px-3 font-medium">
                {selectedAmount.toLocaleString()}円の手数料
              </th>
              <th className="text-center py-3 px-3 font-medium">種別</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map(({ exchange, cost }, index) => {
              const feeRate =
                mode === "taker"
                  ? exchange.fees.exchangeTaker ?? exchange.fees.dealerSpread
                  : exchange.fees.exchangeMaker;
              const isRebate = (feeRate ?? 0) < 0;
              const isLowest = cost !== null && cost >= 0 && cost === minCost;
              const isHighest =
                cost !== null && cost === maxCost && maxCost > minCost;
              const feeType =
                exchange.fees.exchangeTaker !== undefined
                  ? "取引所"
                  : exchange.fees.dealerSpread !== undefined
                  ? "販売所"
                  : "—";

              return (
                <tr
                  key={exchange.id}
                  onClick={() => onSelectExchange(exchange)}
                  className="cursor-pointer hover:bg-blue-50/40 transition-colors"
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      {index === 0 && cost !== null && (
                        <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-md font-bold flex-shrink-0">
                          最安
                        </span>
                      )}
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: exchange.logoColor }}
                      >
                        {exchange.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800 text-sm">
                        {exchange.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        exchange.region === "domestic"
                          ? "bg-pink-50 text-pink-600"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      {exchange.region === "domestic" ? "国内" : "海外"}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-3 text-center text-sm font-bold ${
                      isRebate ? "text-emerald-600" : "text-gray-700"
                    }`}
                  >
                    {feeRate !== undefined
                      ? `${feeRate.toFixed(2)}%`
                      : "—"}
                  </td>
                  <CostCell
                    value={cost}
                    isLowest={isLowest}
                    isHighest={isHighest}
                    isRebate={isRebate}
                  />
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                        feeType === "取引所"
                          ? "bg-emerald-50 text-emerald-700"
                          : feeType === "販売所"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      {feeType}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50">
        <p className="text-xs text-gray-400">
          ※ 販売所のスプレッドは概算値です。実際は市況により変動します。
        </p>
      </div>
    </div>
  );
}

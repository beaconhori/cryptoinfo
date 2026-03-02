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
  if (fees.exchangeTaker !== undefined) {
    return amount * (fees.exchangeTaker / 100);
  }
  if (fees.dealerSpread !== undefined) {
    return amount * (fees.dealerSpread / 100);
  }
  return null;
}

function calcMakerCost(exchange: Exchange, amount: number): number | null {
  const { fees } = exchange;
  if (fees.exchangeMaker !== undefined) {
    return amount * (fees.exchangeMaker / 100);
  }
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
  if (value === null) return <td className="py-3 px-3 text-center text-gray-300">—</td>;

  return (
    <td
      className={`py-3 px-3 text-center text-sm font-medium ${
        isRebate
          ? "text-green-600"
          : isLowest
          ? "text-blue-700 bg-blue-50"
          : isHighest
          ? "text-red-500 bg-red-50"
          : "text-gray-700"
      }`}
    >
      <span className="flex items-center justify-center gap-0.5">
        {isLowest && !isRebate && <ChevronDown size={12} className="text-blue-500" />}
        {isHighest && <ChevronUp size={12} className="text-red-400" />}
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-500" />
          <h2 className="font-bold text-gray-900">取引コスト比較</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* モード切替 */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setMode("taker")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "taker"
                  ? "bg-indigo-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Taker / 販売所
            </button>
            <button
              onClick={() => setMode("maker")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "maker"
                  ? "bg-indigo-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Maker
            </button>
          </div>
          {/* 金額選択 */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {TRADE_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedAmount === amount
                    ? "bg-indigo-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {(amount / 10000).toLocaleString()}万円
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500">
              <th className="text-left py-2.5 px-4 font-medium">取引所</th>
              <th className="text-center py-2.5 px-3 font-medium">地域</th>
              <th className="text-center py-2.5 px-3 font-medium">手数料率</th>
              <th className="text-center py-2.5 px-3 font-medium">
                {selectedAmount.toLocaleString()}円の取引コスト
              </th>
              <th className="text-center py-2.5 px-3 font-medium">手数料種別</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map(({ exchange, cost }, index) => {
              const feeRate =
                mode === "taker"
                  ? exchange.fees.exchangeTaker ?? exchange.fees.dealerSpread
                  : exchange.fees.exchangeMaker;
              const isRebate = (feeRate ?? 0) < 0;
              const isLowest =
                cost !== null && cost >= 0 && cost === minCost;
              const isHighest = cost !== null && cost === maxCost && maxCost > minCost;
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
                  className={`cursor-pointer hover:bg-indigo-50 transition-colors ${
                    index === 0 && cost !== null ? "bg-blue-50/30" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {index === 0 && cost !== null && (
                        <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">
                          最安
                        </span>
                      )}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
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
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {exchange.region === "domestic" ? "国内" : "海外"}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-3 text-center text-sm font-bold ${
                      isRebate ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    {feeRate !== undefined
                      ? `${feeRate < 0 ? "" : ""}${feeRate.toFixed(2)}%`
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
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        feeType === "取引所"
                          ? "bg-green-50 text-green-700"
                          : feeType === "販売所"
                          ? "bg-orange-50 text-orange-700"
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
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          ※ 販売所のスプレッドは概算値です。実際は市況により変動します。行をクリックすると詳細が表示されます。
        </p>
      </div>
    </div>
  );
}

import { Exchange } from "@/types/exchange";

/** 基準年（最古の取引所 Bitstamp が設立された年） */
const OLDEST_YEAR = 2011;
const CURRENT_YEAR = 2026;
const MAX_YEARS = CURRENT_YEAR - OLDEST_YEAR; // 15年

/**
 * 継続年数スコア（0〜5点、小数点1桁）
 * 最も古い取引所（Bitstamp 2011年）= 5点 を基準に比例計算
 */
export function calcYearsScore(established: number): number {
  const years = CURRENT_YEAR - established;
  const raw = (years / MAX_YEARS) * 5;
  // 小数点1桁に丸める
  return Math.round(Math.min(raw, 5) * 10) / 10;
}

/**
 * 総合スコア（0〜10点、小数点1桁）
 * = 事故歴スコア(1〜5) + 継続年数スコア(0〜5)
 */
export function calcTotalScore(exchange: Exchange): number {
  const secScore = exchange.trustScore; // 1〜5
  const yearsScore = calcYearsScore(exchange.established);
  return Math.round((secScore + yearsScore) * 10) / 10;
}

/** 運営年数（満年数） */
export function calcYears(established: number): number {
  return CURRENT_YEAR - established;
}

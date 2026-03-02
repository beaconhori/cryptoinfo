import { supabase } from "./supabase";
import { Exchange, FeeStructure, SpreadRating } from "@/types/exchange";

/** Supabase の行 (snake_case) → アプリの Exchange 型 (camelCase) へ変換 */
function rowToExchange(row: Record<string, unknown>): Exchange {
  const fees = row.fees as Record<string, unknown>;

  const feeStructure: FeeStructure = {
    roundTripCostPct: fees.roundTripCostPct as number,
    spreadRating: fees.spreadRating as SpreadRating,
    ...(fees.exchangeMaker !== undefined && fees.exchangeMaker !== null
      ? { exchangeMaker: fees.exchangeMaker as number }
      : {}),
    ...(fees.exchangeTaker !== undefined && fees.exchangeTaker !== null
      ? { exchangeTaker: fees.exchangeTaker as number }
      : {}),
    ...(fees.dealerSpread !== undefined && fees.dealerSpread !== null
      ? { dealerSpread: fees.dealerSpread as number }
      : {}),
    ...(fees.depositFeeNote ? { depositFeeNote: fees.depositFeeNote as string } : {}),
    ...(fees.withdrawalFeeNote ? { withdrawalFeeNote: fees.withdrawalFeeNote as string } : {}),
  };

  return {
    id: row.id as string,
    name: row.name as string,
    nameEn: row.name_en as string,
    region: row.region as "domestic" | "overseas" | "dex",
    country: row.country as string,
    established: row.established as number,
    url: row.url as string,
    domain: row.domain as string,
    logoColor: row.logo_color as string,
    description: row.description as string,
    tokens: row.tokens as Exchange["tokens"],
    features: row.features as Exchange["features"],
    fees: feeStructure,
    japaneseSupport: row.japanese_support as boolean,
    fsaRegistered: row.fsa_registered as boolean,
    trustScore: row.trust_score as number,
    ...(row.logo_file ? { logoFile: row.logo_file as string } : {}),
    ...(row.min_trade_amount_jpy !== null ? { minTradeAmountJPY: row.min_trade_amount_jpy as number } : {}),
    ...(row.max_leverage !== null ? { maxLeverage: row.max_leverage as number } : {}),
    ...(row.trading_pairs !== null ? { tradingPairs: row.trading_pairs as number } : {}),
    ...(row.volume_rank !== null ? { volumeRank: row.volume_rank as number } : {}),
    ...(row.notes ? { notes: row.notes as string } : {}),
    ...(row.affiliate_url !== null ? { affiliateUrl: row.affiliate_url as string } : {}),
    ...(row.affiliate_type ? { affiliateType: row.affiliate_type as "asp" | "referral" | "none" } : {}),
    ...(row.affiliate_note ? { affiliateNote: row.affiliate_note as string } : {}),
    ...(row.tokens_url ? { tokensUrl: row.tokens_url as string } : {}),
  };
}

export async function fetchExchanges(): Promise<Exchange[]> {
  const { data, error } = await supabase
    .from("exchanges")
    .select("*")
    .order("trust_score", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return [];
  }

  return (data ?? []).map(rowToExchange);
}

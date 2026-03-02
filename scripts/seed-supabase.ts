/**
 * Supabase にすべての取引所データを投入するスクリプト
 *
 * 使い方:
 *   1. .env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定
 *   2. npx tsx --env-file=.env.local scripts/seed-supabase.ts
 */

import { createClient } from "@supabase/supabase-js";
import { exchanges } from "../src/data/exchanges";
import { Exchange } from "../src/types/exchange";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("環境変数 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Exchange (camelCase) → DB行 (snake_case) に変換 */
function exchangeToRow(ex: Exchange) {
  return {
    id: ex.id,
    name: ex.name,
    name_en: ex.nameEn,
    region: ex.region,
    country: ex.country,
    established: ex.established,
    url: ex.url,
    domain: ex.domain,
    logo_file: ex.logoFile ?? null,
    logo_color: ex.logoColor,
    description: ex.description,
    tokens: ex.tokens,
    features: ex.features,
    fees: ex.fees,
    min_trade_amount_jpy: ex.minTradeAmountJPY ?? null,
    max_leverage: ex.maxLeverage ?? null,
    trading_pairs: ex.tradingPairs ?? null,
    japanese_support: ex.japaneseSupport,
    fsa_registered: ex.fsaRegistered,
    trust_score: ex.trustScore,
    volume_rank: ex.volumeRank ?? null,
    notes: ex.notes ?? null,
    affiliate_url: ex.affiliateUrl ?? null,
    affiliate_type: ex.affiliateType ?? null,
    affiliate_note: ex.affiliateNote ?? null,
  };
}

async function seed() {
  console.log(`${exchanges.length} 件の取引所データを Supabase に投入します...`);

  const rows = exchanges.map(exchangeToRow);

  const { error } = await supabase
    .from("exchanges")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("投入エラー:", error.message);
    process.exit(1);
  }

  console.log("完了しました！");
}

seed();

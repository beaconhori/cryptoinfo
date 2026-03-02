import { createClient } from "@supabase/supabase-js";
import { exchanges } from "../src/data/exchanges";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function main() {
  // 1. スキップ（削除は不要）
  console.log("ℹ skipping delete step");

  // 2. 新件をupsert
  const targets = ["binance-japan"];
  const newExchanges = exchanges.filter((e) => targets.includes(e.id));

  for (const ex of newExchanges) {
    const row = {
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
      tokens_url: ex.tokensUrl ?? null,
    };
    const { error } = await supabase.from("exchanges").upsert(row);
    if (error) console.error(`INSERT ${ex.id} error:`, error.message);
    else console.log(`✓ ${ex.name} inserted`);
  }
  console.log("Done!");
}

main();

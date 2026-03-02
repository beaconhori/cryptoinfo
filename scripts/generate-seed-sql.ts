/**
 * INSERT SQL を標準出力に出力するスクリプト
 * npx tsx scripts/generate-seed-sql.ts > /tmp/seed.sql
 */
import { exchanges } from "../src/data/exchanges";

function esc(s: string | undefined | null): string {
  if (s === undefined || s === null) return "NULL";
  return `'${s.replace(/'/g, "''")}'`;
}

function arr(a: string[]): string {
  return `ARRAY[${a.map((v) => `'${v}'`).join(",")}]`;
}

function jsonEsc(o: object): string {
  return `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;
}

function b(v: boolean): string {
  return v ? "true" : "false";
}

function n(v: number | undefined | null): string {
  return v !== undefined && v !== null ? String(v) : "NULL";
}

for (const ex of exchanges) {
  const cols = [
    "id","name","name_en","region","country","established",
    "url","domain","logo_file","logo_color","description",
    "tokens","features","fees",
    "min_trade_amount_jpy","max_leverage","trading_pairs",
    "japanese_support","fsa_registered","trust_score","volume_rank",
    "notes","affiliate_url","affiliate_type","affiliate_note",
  ].join(",");

  const vals = [
    esc(ex.id),
    esc(ex.name),
    esc(ex.nameEn),
    esc(ex.region),
    esc(ex.country),
    ex.established,
    esc(ex.url),
    esc(ex.domain),
    ex.logoFile ? esc(ex.logoFile) : "NULL",
    esc(ex.logoColor),
    esc(ex.description),
    arr(ex.tokens as string[]),
    arr(ex.features as string[]),
    jsonEsc(ex.fees),
    n(ex.minTradeAmountJPY),
    n(ex.maxLeverage),
    n(ex.tradingPairs),
    b(ex.japaneseSupport),
    b(ex.fsaRegistered),
    ex.trustScore,
    n(ex.volumeRank),
    esc(ex.notes),
    esc(ex.affiliateUrl),
    esc(ex.affiliateType),
    esc(ex.affiliateNote),
  ].join(",");

  console.log(`INSERT INTO exchanges (${cols}) VALUES (${vals}) ON CONFLICT (id) DO NOTHING;`);
}

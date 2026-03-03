import { config } from "dotenv";
config({ path: ".env.local" });
import * as fs from "fs";

const travelRuleData: Record<string, { solution: string; note: string }> = {
  // 国内 TRUST
  "bitflyer":      { solution: "TRUST",       note: "2023年5月30日対応。国内ではCoincheckとのみ直接送受信可" },
  "coincheck":     { solution: "TRUST",       note: "2023年5月31日対応。国内ではbitFlyerとのみ直接送受信可" },
  // 国内 Sygna+TRUST
  "sbi-vc-trade":  { solution: "Sygna+TRUST", note: "2024年4月24日よりTRUSTも追加。国内で両ソリューション対応の数少ない取引所" },
  "bitpoint":      { solution: "Sygna+TRUST", note: "2024年1月18日よりTRUSTも追加。国内ハブとして機能" },
  // 国内 Sygna
  "gmo-coin":      { solution: "Sygna",       note: "2023年5月31日対応。bitFlyer・Coincheckへの直接送金は不可" },
  "bitbank":       { solution: "Sygna",       note: "2023年6月9日対応。bitFlyer・Coincheckへの直接送金は不可" },
  "rakuten-wallet":{ solution: "Sygna",       note: "JVCEA加盟。Sygnaネットワーク内の取引所と送受信可" },
  "sblox":         { solution: "Sygna",       note: "JVCEA加盟。Sygnaネットワーク内の取引所と送受信可" },
  "bittrade":      { solution: "Sygna",       note: "JVCEA加盟。Sygnaネットワーク内の取引所と送受信可" },
  // 国内 不明
  "bybit-jp":      { solution: "不明",        note: "Bybitグローバルはトラベルルール対応済みだが、日本法人の詳細は未公表" },
  "mercoin":       { solution: "不明",        note: "比較的新しい取引所のため詳細情報未確認" },
  "okx-japan":     { solution: "不明",        note: "OKX JapanのJVCEA加盟に基づく対応状況は未確認" },
  "binance-japan": { solution: "不明",        note: "Binance Japanの国内向けトラベルルール対応の詳細は未公表" },
  // 海外 TRUST
  "bitget":        { solution: "TRUST",       note: "TRUSTネットワーク正式参加。日本の国内TRUST採用取引所と送受信可" },
  // 海外 独自対応
  "kucoin":        { solution: "独自対応",     note: "2025年2月24日より全入出金に必須。KuCoin独自システムで対応" },
  "crypto-com":    { solution: "独自対応",     note: "複数国の規制当局に登録済み。Notabeneなど独自システムで対応" },
  "hashkey-global":{ solution: "独自対応",     note: "香港SFC（証券先物委員会）規制準拠。アジア最大級の規制対応取引所" },
  "bitstamp":      { solution: "独自対応",     note: "EU・MiCA規制準拠。欧州最古参取引所として厳格なAML/KYC体制" },
  // 海外 不明
  "mexc":          { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },
  "zoomex":        { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },
  "bingx":         { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },
  "phemex":        { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },
  "pionex":        { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },
  "woox":          { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },
  "bitrue":        { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },
  // DEX N/A
  "uniswap":       { solution: "N/A",         note: "DEX（分散型）。KYC不要のため規制対象外" },
  "dydx":          { solution: "N/A",         note: "DEX（分散型）。KYC不要のため規制対象外" },
  "gmx":           { solution: "N/A",         note: "DEX（分散型）。KYC不要のため規制対象外" },
  "jupiter":       { solution: "N/A",         note: "DEX（分散型）。KYC不要のため規制対象外" },
  "hyperliquid":   { solution: "N/A",         note: "DEX（分散型）。KYC不要のため規制対象外" },
};

let content = fs.readFileSync("src/data/exchanges.ts", "utf-8");

for (const [id, data] of Object.entries(travelRuleData)) {
  // tokensUrl行の後に travelRule を追加
  const tokensUrlPattern = new RegExp(
    `(    tokensUrl: ".*?",\n)(  },)`,
    "g"
  );

  // 各取引所ブロックを特定するため id で検索
  const idPattern = new RegExp(
    `(    id: "${id}",[\\s\\S]*?)(    tokensUrl: "(.*?)",\n)(  },)`,
  );
  if (idPattern.test(content)) {
    content = content.replace(idPattern, (match, before, tokensLine, url, closing) => {
      return `${before}${tokensLine}    travelRule: { solution: "${data.solution}", note: "${data.note}" },\n${closing}`;
    });
    console.log(`✓ Added travelRule to ${id} (with tokensUrl)`);
    continue;
  }

  // tokensUrl がない場合、affiliateNote の後に追加
  const affiliateNotePattern = new RegExp(
    `(    id: "${id}",[\\s\\S]*?)(    affiliateNote: "(.*?)",\n)(  },)`,
  );
  if (affiliateNotePattern.test(content)) {
    content = content.replace(affiliateNotePattern, (match, before, affiliateLine, note, closing) => {
      return `${before}${affiliateLine}    travelRule: { solution: "${data.solution}", note: "${data.note}" },\n${closing}`;
    });
    console.log(`✓ Added travelRule to ${id} (with affiliateNote)`);
    continue;
  }

  console.warn(`⚠ Could not find pattern for ${id}`);
}

fs.writeFileSync("src/data/exchanges.ts", content);
console.log("\nDone! exchanges.ts updated.");

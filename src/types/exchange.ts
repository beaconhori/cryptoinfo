export type Region = "domestic" | "overseas";

export type Token =
  | "BTC"
  | "ETH"
  | "XRP"
  | "SOL"
  | "ADA"
  | "DOT"
  | "MATIC"
  | "DOGE"
  | "LTC"
  | "BNB"
  | "AVAX"
  | "LINK"
  | "UNI"
  | "ATOM"
  | "FIL"
  | "MONA"
  | "BCH"
  | "ETC"
  | "XEM"
  | "XLM"
  | "USDT"
  | "USDC"
  | "LSK"
  | "IOST"
  | "QTUM"
  | "ENJ"
  | "SAND"
  | "CHZ"
  | "BAT"
  | "FLARE";

export type Feature =
  | "spot"
  | "futures"
  | "margin"
  | "staking"
  | "lending"
  | "nft"
  | "copy_trading"
  | "options"
  | "demo"
  | "api"
  | "mobile_app"
  | "japan_yen_deposit"
  | "credit_card";

export interface FeeStructure {
  /** 取引所形式: maker手数料(%) */
  exchangeMaker?: number;
  /** 取引所形式: taker手数料(%) */
  exchangeTaker?: number;
  /** 販売所形式: スプレッド目安(%) */
  dealerSpread?: number;
  /** 入金手数料メモ */
  depositFeeNote?: string;
  /** 出金手数料メモ */
  withdrawalFeeNote?: string;
}

export interface Exchange {
  id: string;
  name: string;
  nameEn: string;
  region: Region;
  country: string;
  established: number;
  url: string;
  /** Clearbit logo API用ドメイン */
  domain: string;
  logoColor: string;
  description: string;
  tokens: Token[];
  features: Feature[];
  fees: FeeStructure;
  /** 最低取引額(円) */
  minTradeAmountJPY?: number;
  /** レバレッジ最大倍率 */
  maxLeverage?: number;
  /** 取扱通貨ペア数 */
  tradingPairs?: number;
  /** 日本語サポートの有無 */
  japaneseSupport: boolean;
  /** 金融庁登録済みか */
  fsaRegistered: boolean;
  /** 信頼スコア(1-5) */
  trustScore: number;
  /** 取引量ランキング(CoinMarketCap等) */
  volumeRank?: number;
  /** 特記事項 */
  notes?: string;
  /** アフィリエイト/リファラルリンク (各自で差し替え) */
  affiliateUrl?: string;
  /** アフィリエイト種別 */
  affiliateType?: "asp" | "referral" | "none";
  /** アフィリエイト登録先メモ */
  affiliateNote?: string;
}

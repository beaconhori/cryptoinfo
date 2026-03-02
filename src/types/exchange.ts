export type Region = "domestic" | "overseas" | "dex";

export type Token =
  // ── メジャー ──────────────────────────────
  | "BTC"   // ビットコイン
  | "ETH"   // イーサリアム
  | "XRP"   // リップル
  | "SOL"   // ソラナ
  | "ADA"   // カルダノ
  | "DOT"   // ポルカドット
  | "DOGE"  // ドージコイン
  | "LTC"   // ライトコイン
  | "BCH"   // ビットコインキャッシュ
  | "AVAX"  // アバランチ
  | "LINK"  // チェーンリンク
  | "ATOM"  // コスモス
  | "FIL"   // ファイルコイン
  | "BNB"   // バイナンスコイン
  // ── DeFi / ステーブル ─────────────────────
  | "USDT"  // テザー
  | "USDC"  // USDコイン
  | "DAI"   // ダイ
  | "MKR"   // メーカー
  | "UNI"   // ユニスワップ
  | "AAVE"  // アーベ
  | "GRT"   // グラフ
  // ── Layer2 / インフラ ─────────────────────
  | "MATIC" // ポリゴン（旧称）
  | "POL"   // ポリゴン（新称）
  | "ARB"   // アービトラム
  | "OP"    // オプティミズム
  | "IMX"   // イミュータブルX
  | "ASTR"  // アスター（日本発）
  | "OAS"   // オアシス（日本発）
  | "HBAR"  // ヘデラ
  | "ALGO"  // アルゴランド
  | "XTZ"   // テゾス
  | "FLR"   // フレア
  | "NEAR"  // ニア
  | "APT"   // アプトス
  | "TRX"   // トロン
  // ── NFT / ゲーム ──────────────────────────
  | "AXS"   // アクシー
  | "SAND"  // サンドボックス
  | "MANA"  // ディセントラランド
  | "ENJ"   // エンジン
  | "CHZ"   // チリーズ
  | "APE"   // エイプコイン
  | "SHIB"  // シバイヌ
  | "PEPE"  // ペペ
  | "RNDR"  // レンダー
  | "MASK"  // マスク
  // ── 国内主要 ──────────────────────────────
  | "XLM"   // ステラルーメン
  | "XEM"   // ネム
  | "XYM"   // シンボル
  | "MONA"  // モナコイン
  | "LSK"   // リスク
  | "IOST"  // アイオーエスティー
  | "QTUM"  // クアンタム
  | "BAT"   // ベーシックアテンショントークン
  | "ETC"   // イーサリアムクラシック
  | "OMG"   // OMGネットワーク
  | "FLARE" // フレア（旧表記）
  | "ZPG";  // ザイフプレミアムゴールド

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

/** スプレッドの広さ評価 */
export type SpreadRating = "tight" | "moderate" | "wide" | "very_wide";

export interface FeeStructure {
  /** 取引所形式: maker手数料(%) */
  exchangeMaker?: number;
  /** 取引所形式: taker手数料(%) */
  exchangeTaker?: number;
  /** 販売所形式: スプレッド目安(%) */
  dealerSpread?: number;
  /**
   * 実質的な往復コスト目安(%) — 買って即売った場合の損失率
   * 取引所形式: taker×2 + 板スプレッド
   * 販売所形式: スプレッド そのもの
   */
  roundTripCostPct: number;
  /** スプレッド評価 */
  spreadRating: SpreadRating;
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
  /** public/logos/ 配下のローカルロゴファイル名（未設定の場合はClearbit APIを使用） */
  logoFile?: string;
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
  /** 対応トークン一覧ページURL（主に海外取引所向け） */
  tokensUrl?: string;
}

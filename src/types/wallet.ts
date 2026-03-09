export type WalletType = "software" | "hardware" | "browser_extension" | "mobile" | "smart_account";

export type WalletChain =
  | "EVM"    // Ethereum互換チェーン全般
  | "BTC"    // Bitcoin
  | "SOL"    // Solana
  | "COSMOS" // Cosmos系
  | "SUI"    // Sui
  | "APTOS"  // Aptos
  | "NEAR"   // NEAR Protocol
  | "TRON";  // TRON

export type WalletFeature =
  | "dex_swap"        // DEXスワップ対応
  | "nft"             // NFT管理
  | "staking"         // ステーキング
  | "hardware_connect"// ハードウェアウォレット接続
  | "multi_account"   // 複数アカウント管理
  | "browser_ext"     // ブラウザ拡張機能
  | "mobile_app"      // モバイルアプリ
  | "web_app"         // Webアプリ
  | "open_source"     // オープンソース
  | "ledger_support"  // Ledger連携
  | "trezor_support"  // Trezor連携
  | "wc2"             // WalletConnect v2
  | "passkey"         // パスキー/生体認証
  | "social_recovery" // ソーシャルリカバリー
  | "watch_only"      // ウォッチオンリー対応
  | "gas_abstraction" // ガス代抽象化（代替トークンでガス支払い・無料化）
  | "cross_chain"     // クロスチェーン操作（ブリッジ不要）
  | "multisig"        // マルチシグ対応
  | "erc4337"         // ERC-4337スマートアカウント対応
  | "debit_card";     // 暗号資産デビットカード

export type SecurityLevel = "high" | "medium" | "low";

export interface Wallet {
  id: string;
  name: string;
  nameEn: string;
  type: WalletType;
  /** ウォレットの説明 */
  description: string;
  /** 公式サイトURL */
  url: string;
  /** Clearbit logo API用ドメイン */
  domain: string;
  /** public/logos/ 配下のローカルロゴファイル名 */
  logoFile?: string;
  /** ブランドカラー（16進数） */
  logoColor: string;
  /** 対応チェーン */
  chains: WalletChain[];
  /** 機能一覧 */
  features: WalletFeature[];
  /** セキュリティ評価 */
  securityLevel: SecurityLevel;
  /** 信頼スコア (1-10) */
  trustScore: number;
  /** 設立年 */
  established: number;
  /** 日本語対応 */
  japaneseSupport: boolean;
  /** 無料で使えるか */
  isFree: boolean;
  /** 価格メモ（有料の場合） */
  priceNote?: string;
  /** 特記事項 */
  notes?: string;
  /** アフィリエイトURL */
  affiliateUrl?: string;
}

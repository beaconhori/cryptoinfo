import { supabase } from "./supabase";
import { Wallet, WalletType, WalletChain, WalletFeature, SecurityLevel } from "@/types/wallet";

function rowToWallet(row: Record<string, unknown>): Wallet {
  return {
    id: row.id as string,
    name: row.name as string,
    nameEn: row.name_en as string,
    type: row.type as WalletType,
    description: row.description as string,
    url: row.url as string,
    domain: row.domain as string,
    logoColor: row.logo_color as string,
    chains: (row.chains as string[]) as WalletChain[],
    features: (row.features as string[]) as WalletFeature[],
    securityLevel: row.security_level as SecurityLevel,
    trustScore: row.trust_score as number,
    established: row.established as number,
    japaneseSupport: row.japanese_support as boolean,
    isFree: row.is_free as boolean,
    ...(row.logo_file ? { logoFile: row.logo_file as string } : {}),
    ...(row.price_note ? { priceNote: row.price_note as string } : {}),
    ...(row.notes ? { notes: row.notes as string } : {}),
    ...(row.affiliate_url ? { affiliateUrl: row.affiliate_url as string } : {}),
  };
}

export async function fetchWallets(): Promise<Wallet[]> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .order("trust_score", { ascending: false });

  if (error) {
    console.error("Supabase wallets fetch error:", error.message);
    return [];
  }

  return (data ?? []).map(rowToWallet);
}

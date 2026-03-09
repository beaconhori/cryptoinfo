import { SecurityLevel } from "@/types/wallet";

/** セキュリティレベルからスコアを算出（ウォレットはセキュリティが最重要指標） */
export const SECURITY_SCORE: Record<SecurityLevel, number> = {
  high:   9.0,
  medium: 7.0,
  low:    5.0,
};

export function calcWalletScore(securityLevel: SecurityLevel): number {
  return SECURITY_SCORE[securityLevel];
}

export function walletScoreColor(securityLevel: SecurityLevel): string {
  const score = SECURITY_SCORE[securityLevel];
  if (score >= 8.5) return "#10B981"; // emerald
  if (score >= 6.5) return "#3B82F6"; // blue
  return "#F59E0B";                   // amber
}

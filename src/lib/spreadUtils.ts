import { SpreadRating } from "@/types/exchange";

export const SPREAD_RATING_CONFIG: Record<
  SpreadRating,
  { label: string; color: string; bg: string; border: string; description: string }
> = {
  tight: {
    label: "狭い",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    description: "流動性が高く、取引コストが最小限です",
  },
  moderate: {
    label: "普通",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    description: "標準的なスプレッド幅です",
  },
  wide: {
    label: "広い",
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    description: "スプレッドが広めです。取引前に確認を推奨します",
  },
  very_wide: {
    label: "非常に広い",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    description: "スプレッドが非常に広く、実質コストが高くなります",
  },
};

export function getSpreadConfig(rating: SpreadRating) {
  return SPREAD_RATING_CONFIG[rating];
}

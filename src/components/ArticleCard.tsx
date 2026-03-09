import Link from "next/link";
import { Article } from "@/types/article";

const CATEGORY_CONFIG: Record<Article["category"], { label: string; color: string; bg: string }> = {
  wallet: { label: "ウォレット", color: "#7C3AED", bg: "#F5F3FF" },
  exchange: { label: "取引所", color: "#1D4ED8", bg: "#EFF6FF" },
  guide: { label: "ガイド", color: "#047857", bg: "#ECFDF5" },
};

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const cat = CATEGORY_CONFIG[article.category];
  const dateStr = new Date(article.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${article.slug}`} className="block group">
      <article className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-gray-100 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ color: cat.color, backgroundColor: cat.bg }}
          >
            {cat.label}
          </span>
          {article.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-sm font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
          {article.title}
        </h2>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
          {article.description}
        </p>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">{article.author}</span>
          <span className="text-xs text-gray-400">{dateStr}</span>
        </div>
      </article>
    </Link>
  );
}

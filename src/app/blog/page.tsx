import { fetchArticles } from "@/lib/fetchArticles";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";
import type { Metadata } from "next";
import { Article } from "@/types/article";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "記事一覧 | 暗号通貨取引所ガイド",
  description: "暗号資産・ウォレット・取引所に関する初心者向けガイド記事の一覧です。",
};

const CATEGORY_TABS: { value: Article["category"] | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "wallet", label: "ウォレット" },
  { value: "exchange", label: "取引所" },
  { value: "guide", label: "ガイド" },
];

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await searchParams;
  const validCategory = ["wallet", "exchange", "guide"].includes(category ?? "")
    ? (category as Article["category"])
    : undefined;

  const articles = await fetchArticles(validCategory);

  return (
    <div className="min-h-screen bg-[#D9E8F4]">
      {/* ヘッダー */}
      <header className="bg-[#1E3A8A] px-4 md:px-8 py-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-blue-300 hover:text-white transition-colors text-sm">
            ← トップへ戻る
          </Link>
          <div className="flex-1">
            <p className="text-[10px] text-blue-300 font-semibold tracking-widest uppercase">暗号通貨</p>
            <h1 className="text-xl font-extrabold text-white leading-tight">記事・ガイド</h1>
          </div>
        </div>
      </header>

      {/* カテゴリータブ */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex gap-1 overflow-x-auto py-3">
          {CATEGORY_TABS.map((tab) => {
            const isActive = (tab.value === "all" && !category) || tab.value === category;
            const href = tab.value === "all" ? "/blog" : `/blog?category=${tab.value}`;
            return (
              <Link
                key={tab.value}
                href={href}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 記事グリッド */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="font-medium text-gray-500">記事がまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

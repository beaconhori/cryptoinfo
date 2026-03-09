import { fetchArticleBySlug, fetchArticles } from "@/lib/fetchArticles";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 60;

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await fetchArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} | 暗号通貨取引所ガイド`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  wallet: { label: "ウォレット", color: "#7C3AED", bg: "#F5F3FF" },
  exchange: { label: "取引所", color: "#1D4ED8", bg: "#EFF6FF" },
  guide: { label: "ガイド", color: "#047857", bg: "#ECFDF5" },
};

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) notFound();

  const cat = CATEGORY_CONFIG[article.category] ?? CATEGORY_CONFIG.guide;
  const dateStr = new Date(article.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedStr = new Date(article.updatedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#D9E8F4]">
      {/* ヘッダー */}
      <header className="bg-[#1E3A8A] px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/blog" className="text-blue-300 hover:text-white transition-colors text-sm flex-shrink-0">
            ← 記事一覧へ
          </Link>
          <div>
            <p className="text-[10px] text-blue-300 font-semibold tracking-widest uppercase">暗号通貨</p>
            <p className="text-xl font-extrabold text-white leading-tight">記事・ガイド</p>
          </div>
        </div>
      </header>

      {/* 記事本文 */}
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 記事ヘッダー */}
          <div className="px-6 md:px-10 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ color: cat.color, backgroundColor: cat.bg }}
              >
                {cat.label}
              </span>
              {article.tags.map((tag) => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug mb-3">
              {article.title}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{article.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>{article.author}</span>
              <span>公開: {dateStr}</span>
              {updatedStr !== dateStr && <span>更新: {updatedStr}</span>}
            </div>
          </div>

          {/* Markdown本文 */}
          <div className="px-6 md:px-10 py-8 prose prose-sm md:prose-base prose-gray max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
            prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-li:text-gray-700
            prose-strong:text-gray-900
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
            prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-sm prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-gray-900 prose-pre:rounded-xl
            prose-table:text-sm prose-table:w-full
            prose-th:bg-gray-50 prose-th:font-semibold prose-th:text-gray-700 prose-th:px-3 prose-th:py-2
            prose-td:px-3 prose-td:py-2 prose-td:text-gray-600
            prose-thead:border-b prose-thead:border-gray-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
          </div>
        </article>

        {/* フッターナビ */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/blog"
            className="px-6 py-2.5 bg-white rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 shadow-sm hover:shadow transition-all"
          >
            ← 記事一覧へ戻る
          </Link>
        </div>
      </main>
    </div>
  );
}

import { supabase } from "./supabase";
import { Article, ArticleCategory } from "@/types/article";

function rowToArticle(row: Record<string, unknown>): Article {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as ArticleCategory,
    tags: (row.tags as string[]) ?? [],
    body: row.body as string,
    author: row.author as string,
    publishedAt: row.published_at as string,
    updatedAt: row.updated_at as string,
    isPublished: row.is_published as boolean,
  };
}

export async function fetchArticles(category?: ArticleCategory): Promise<Article[]> {
  let query = supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase articles fetch error:", error.message);
    return [];
  }

  return (data ?? []).map(rowToArticle);
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    console.error("Supabase article fetch error:", error.message);
    return null;
  }

  return data ? rowToArticle(data as Record<string, unknown>) : null;
}

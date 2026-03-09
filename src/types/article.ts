export type ArticleCategory = "wallet" | "exchange" | "guide";

export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ArticleCategory;
  tags: string[];
  body: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  isPublished: boolean;
}

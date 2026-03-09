-- articles テーブル作成
-- Supabase ダッシュボードの SQL エディタで実行してください

CREATE TABLE IF NOT EXISTS articles (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'wallet', -- wallet / exchange / guide
  tags         TEXT[] NOT NULL DEFAULT '{}',
  body         TEXT NOT NULL,                  -- Markdown形式
  author       TEXT NOT NULL DEFAULT 'cryptoinfo編集部',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON articles FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles(published_at DESC);

-- ウォレット情報テーブル
CREATE TABLE IF NOT EXISTS wallets (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  name_en           TEXT NOT NULL,
  type              TEXT NOT NULL,       -- software / hardware / browser_extension / mobile
  description       TEXT NOT NULL,
  url               TEXT NOT NULL,
  domain            TEXT NOT NULL,
  logo_file         TEXT,
  logo_color        TEXT NOT NULL DEFAULT '#6366F1',
  chains            TEXT[] NOT NULL DEFAULT '{}',
  features          TEXT[] NOT NULL DEFAULT '{}',
  security_level    TEXT NOT NULL DEFAULT 'medium', -- high / medium / low
  trust_score       INTEGER NOT NULL DEFAULT 7,
  established       INTEGER NOT NULL,
  japanese_support  BOOLEAN NOT NULL DEFAULT false,
  is_free           BOOLEAN NOT NULL DEFAULT true,
  price_note        TEXT,
  notes             TEXT,
  affiliate_url     TEXT
);

-- RLS有効化
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- 公開読み取りのみ許可
CREATE POLICY "Public read access" ON wallets
  FOR SELECT USING (true);

-- インデックス
CREATE INDEX IF NOT EXISTS wallets_type_idx ON wallets(type);
CREATE INDEX IF NOT EXISTS wallets_trust_score_idx ON wallets(trust_score DESC);

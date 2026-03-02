-- ============================================================
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================================

CREATE TABLE IF NOT EXISTS exchanges (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  name_en              TEXT NOT NULL,
  region               TEXT NOT NULL,
  country              TEXT NOT NULL,
  established          INTEGER NOT NULL,
  url                  TEXT NOT NULL,
  domain               TEXT NOT NULL,
  logo_file            TEXT,
  logo_color           TEXT NOT NULL,
  description          TEXT NOT NULL,
  tokens               TEXT[] NOT NULL DEFAULT '{}',
  features             TEXT[] NOT NULL DEFAULT '{}',
  fees                 JSONB NOT NULL DEFAULT '{}',
  min_trade_amount_jpy INTEGER,
  max_leverage         INTEGER,
  trading_pairs        INTEGER,
  japanese_support     BOOLEAN NOT NULL DEFAULT false,
  fsa_registered       BOOLEAN NOT NULL DEFAULT false,
  trust_score          INTEGER NOT NULL DEFAULT 3,
  volume_rank          INTEGER,
  notes                TEXT,
  affiliate_url        TEXT,
  affiliate_type       TEXT,
  affiliate_note       TEXT
);

-- Row Level Security: 公開読み取りのみ許可
ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON exchanges
  FOR SELECT USING (true);

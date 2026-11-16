CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  querent VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'General',
  date_time TIMESTAMPTZ NOT NULL,
  notes TEXT DEFAULT '',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS card_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  card_name VARCHAR(100) NOT NULL,
  position_name VARCHAR(100) DEFAULT 'General',
  is_reversed BOOLEAN DEFAULT FALSE
);
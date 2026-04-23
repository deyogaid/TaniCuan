-- Platform Harga Pasar Petani - Database Schema
-- Tabel untuk menyimpan data komoditas, pasar, dan harga OHLC

-- Tabel komoditas (sayur, buah, umbi)
CREATE TABLE IF NOT EXISTS commodities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sayur', 'buah', 'umbi', 'bumbu')),
  unit TEXT DEFAULT 'kg',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pasar induk
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  province TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel harga historis dengan format OHLC untuk candlestick chart
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_id UUID REFERENCES commodities(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  open_price DECIMAL(12,2) NOT NULL,
  high_price DECIMAL(12,2) NOT NULL,
  low_price DECIMAL(12,2) NOT NULL,
  close_price DECIMAL(12,2) NOT NULL,
  volume INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(commodity_id, market_id, date)
);

-- Index untuk query performa
CREATE INDEX IF NOT EXISTS idx_price_history_commodity_date ON price_history(commodity_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_market_date ON price_history(market_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date DESC);

-- Enable RLS (akan ditambahkan policy nanti jika ada auth)
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Policy untuk public read access (tanpa auth untuk MVP)
CREATE POLICY "Allow public read access to commodities" ON commodities FOR SELECT USING (true);
CREATE POLICY "Allow public read access to markets" ON markets FOR SELECT USING (true);
CREATE POLICY "Allow public read access to price_history" ON price_history FOR SELECT USING (true);

-- Tabel untuk menyimpan prediksi harga komoditas
CREATE TABLE IF NOT EXISTS price_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_id UUID REFERENCES commodities(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  predicted_price DECIMAL(12,2) NOT NULL,
  price_low DECIMAL(12,2) NOT NULL,
  price_high DECIMAL(12,2) NOT NULL,
  confidence_level DECIMAL(5,2) NOT NULL, -- 0-100
  model_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(commodity_id, market_id, prediction_date)
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_price_predictions_commodity_date ON price_predictions(commodity_id, prediction_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_predictions_market_date ON price_predictions(market_id, prediction_date DESC);

-- Enable RLS
ALTER TABLE price_predictions ENABLE ROW LEVEL SECURITY;

-- Policy untuk public read access
CREATE POLICY "Allow public read access to price_predictions" ON price_predictions FOR SELECT USING (true);
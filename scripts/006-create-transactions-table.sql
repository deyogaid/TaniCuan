-- Tabel untuk menyimpan transaksi jual/beli komoditas
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Nullable untuk MVP tanpa auth
  commodity_id UUID REFERENCES commodities(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity DECIMAL(10,2) NOT NULL,
  price_per_unit DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_commodity_date ON transactions(commodity_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_market_date ON transactions(market_id, transaction_date DESC);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy untuk public access (MVP tanpa auth)
CREATE POLICY "Allow public access to transactions" ON transactions FOR ALL USING (true);
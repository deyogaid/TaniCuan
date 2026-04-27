-- Seed data untuk transaksi contoh
-- Data ini untuk testing dan demonstrasi

INSERT INTO transactions (commodity_id, market_id, transaction_type, quantity, price_per_unit, transaction_date, notes)
SELECT
  c.id,
  m.id,
  'buy'::text,
  50.0,
  35000.00,
  CURRENT_DATE - INTERVAL '7 days',
  'Pembelian awal minggu'
FROM commodities c
CROSS JOIN markets m
WHERE c.name = 'Bawang Merah' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT DO NOTHING;

INSERT INTO transactions (commodity_id, market_id, transaction_type, quantity, price_per_unit, transaction_date, notes)
SELECT
  c.id,
  m.id,
  'sell'::text,
  45.0,
  38000.00,
  CURRENT_DATE - INTERVAL '3 days',
  'Penjualan dengan keuntungan'
FROM commodities c
CROSS JOIN markets m
WHERE c.name = 'Bawang Merah' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT DO NOTHING;

INSERT INTO transactions (commodity_id, market_id, transaction_type, quantity, price_per_unit, transaction_date, notes)
SELECT
  c.id,
  m.id,
  'buy'::text,
  25.0,
  55000.00,
  CURRENT_DATE - INTERVAL '5 days',
  'Pembelian cabai'
FROM commodities c
CROSS JOIN markets m
WHERE c.name = 'Cabai Merah Keriting' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT DO NOTHING;

INSERT INTO transactions (commodity_id, market_id, transaction_type, quantity, price_per_unit, transaction_date, notes)
SELECT
  c.id,
  m.id,
  'sell'::text,
  20.0,
  62000.00,
  CURRENT_DATE - INTERVAL '1 day',
  'Penjualan cabai'
FROM commodities c
CROSS JOIN markets m
WHERE c.name = 'Cabai Merah Keriting' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT DO NOTHING;
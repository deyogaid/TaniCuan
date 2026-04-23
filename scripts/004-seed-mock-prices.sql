-- Generate mock OHLC price data untuk 30 hari terakhir
-- Data ini realistis berdasarkan harga pasar Indonesia

-- Cabai Merah Keriting (volatile, Rp 40.000 - 80.000/kg)
INSERT INTO price_history (commodity_id, market_id, date, open_price, high_price, low_price, close_price, volume)
SELECT 
  c.id,
  m.id,
  d.date,
  -- Generate realistic OHLC dengan base price + random variation
  ROUND((55000 + (RANDOM() * 20000) - 10000 + (EXTRACT(DOW FROM d.date) * 1000))::numeric, -2) as open_price,
  ROUND((60000 + (RANDOM() * 25000) - 5000 + (EXTRACT(DOW FROM d.date) * 1500))::numeric, -2) as high_price,
  ROUND((50000 + (RANDOM() * 15000) - 10000 + (EXTRACT(DOW FROM d.date) * 500))::numeric, -2) as low_price,
  ROUND((55000 + (RANDOM() * 22000) - 8000 + (EXTRACT(DOW FROM d.date) * 1200))::numeric, -2) as close_price,
  FLOOR(500 + RANDOM() * 2000)::integer as volume
FROM commodities c
CROSS JOIN markets m
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as d(date)
WHERE c.name = 'Cabai Merah Keriting' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT (commodity_id, market_id, date) DO NOTHING;

-- Cabai Rawit Merah (sangat volatile, Rp 50.000 - 120.000/kg)
INSERT INTO price_history (commodity_id, market_id, date, open_price, high_price, low_price, close_price, volume)
SELECT 
  c.id, m.id, d.date,
  ROUND((75000 + (RANDOM() * 30000) - 15000)::numeric, -2),
  ROUND((85000 + (RANDOM() * 40000) - 10000)::numeric, -2),
  ROUND((65000 + (RANDOM() * 25000) - 15000)::numeric, -2),
  ROUND((78000 + (RANDOM() * 35000) - 12000)::numeric, -2),
  FLOOR(300 + RANDOM() * 1500)::integer
FROM commodities c
CROSS JOIN markets m
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as d(date)
WHERE c.name = 'Cabai Rawit Merah' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT (commodity_id, market_id, date) DO NOTHING;

-- Bawang Merah (stabil, Rp 30.000 - 45.000/kg)
INSERT INTO price_history (commodity_id, market_id, date, open_price, high_price, low_price, close_price, volume)
SELECT 
  c.id, m.id, d.date,
  ROUND((35000 + (RANDOM() * 8000) - 4000)::numeric, -2),
  ROUND((38000 + (RANDOM() * 10000) - 3000)::numeric, -2),
  ROUND((32000 + (RANDOM() * 6000) - 4000)::numeric, -2),
  ROUND((36000 + (RANDOM() * 9000) - 4000)::numeric, -2),
  FLOOR(800 + RANDOM() * 3000)::integer
FROM commodities c
CROSS JOIN markets m
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as d(date)
WHERE c.name = 'Bawang Merah' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT (commodity_id, market_id, date) DO NOTHING;

-- Bawang Putih (stabil, Rp 25.000 - 40.000/kg)
INSERT INTO price_history (commodity_id, market_id, date, open_price, high_price, low_price, close_price, volume)
SELECT 
  c.id, m.id, d.date,
  ROUND((30000 + (RANDOM() * 8000) - 4000)::numeric, -2),
  ROUND((34000 + (RANDOM() * 10000) - 3000)::numeric, -2),
  ROUND((27000 + (RANDOM() * 6000) - 4000)::numeric, -2),
  ROUND((31000 + (RANDOM() * 9000) - 4000)::numeric, -2),
  FLOOR(600 + RANDOM() * 2500)::integer
FROM commodities c
CROSS JOIN markets m
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as d(date)
WHERE c.name = 'Bawang Putih' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT (commodity_id, market_id, date) DO NOTHING;

-- Tomat (moderat volatile, Rp 8.000 - 20.000/kg)
INSERT INTO price_history (commodity_id, market_id, date, open_price, high_price, low_price, close_price, volume)
SELECT 
  c.id, m.id, d.date,
  ROUND((12000 + (RANDOM() * 6000) - 3000)::numeric, -2),
  ROUND((15000 + (RANDOM() * 8000) - 2000)::numeric, -2),
  ROUND((10000 + (RANDOM() * 4000) - 3000)::numeric, -2),
  ROUND((13000 + (RANDOM() * 7000) - 3000)::numeric, -2),
  FLOOR(1000 + RANDOM() * 4000)::integer
FROM commodities c
CROSS JOIN markets m
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as d(date)
WHERE c.name = 'Tomat' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT (commodity_id, market_id, date) DO NOTHING;

-- Kentang (stabil, Rp 12.000 - 18.000/kg)
INSERT INTO price_history (commodity_id, market_id, date, open_price, high_price, low_price, close_price, volume)
SELECT 
  c.id, m.id, d.date,
  ROUND((14000 + (RANDOM() * 3000) - 1500)::numeric, -2),
  ROUND((16000 + (RANDOM() * 4000) - 1000)::numeric, -2),
  ROUND((12000 + (RANDOM() * 2500) - 1500)::numeric, -2),
  ROUND((14500 + (RANDOM() * 3500) - 1500)::numeric, -2),
  FLOOR(700 + RANDOM() * 2500)::integer
FROM commodities c
CROSS JOIN markets m
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as d(date)
WHERE c.name = 'Kentang' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT (commodity_id, market_id, date) DO NOTHING;

-- Wortel (stabil, Rp 10.000 - 16.000/kg)
INSERT INTO price_history (commodity_id, market_id, date, open_price, high_price, low_price, close_price, volume)
SELECT 
  c.id, m.id, d.date,
  ROUND((12000 + (RANDOM() * 3000) - 1500)::numeric, -2),
  ROUND((14000 + (RANDOM() * 4000) - 1000)::numeric, -2),
  ROUND((10000 + (RANDOM() * 2500) - 1500)::numeric, -2),
  ROUND((12500 + (RANDOM() * 3500) - 1500)::numeric, -2),
  FLOOR(500 + RANDOM() * 2000)::integer
FROM commodities c
CROSS JOIN markets m
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as d(date)
WHERE c.name = 'Wortel' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT (commodity_id, market_id, date) DO NOTHING;

-- Kubis (murah, stabil, Rp 5.000 - 10.000/kg)
INSERT INTO price_history (commodity_id, market_id, date, open_price, high_price, low_price, close_price, volume)
SELECT 
  c.id, m.id, d.date,
  ROUND((7000 + (RANDOM() * 2000) - 1000)::numeric, -2),
  ROUND((8500 + (RANDOM() * 2500) - 500)::numeric, -2),
  ROUND((5500 + (RANDOM() * 1500) - 1000)::numeric, -2),
  ROUND((7500 + (RANDOM() * 2200) - 1000)::numeric, -2),
  FLOOR(800 + RANDOM() * 3000)::integer
FROM commodities c
CROSS JOIN markets m
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as d(date)
WHERE c.name = 'Kubis' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT (commodity_id, market_id, date) DO NOTHING;

-- Buncis (moderat, Rp 15.000 - 25.000/kg)
INSERT INTO price_history (commodity_id, market_id, date, open_price, high_price, low_price, close_price, volume)
SELECT 
  c.id, m.id, d.date,
  ROUND((18000 + (RANDOM() * 5000) - 2500)::numeric, -2),
  ROUND((21000 + (RANDOM() * 6000) - 1500)::numeric, -2),
  ROUND((15000 + (RANDOM() * 4000) - 2500)::numeric, -2),
  ROUND((19000 + (RANDOM() * 5500) - 2500)::numeric, -2),
  FLOOR(400 + RANDOM() * 1500)::integer
FROM commodities c
CROSS JOIN markets m
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as d(date)
WHERE c.name = 'Buncis' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT (commodity_id, market_id, date) DO NOTHING;

-- Jeruk (moderat, Rp 15.000 - 30.000/kg)
INSERT INTO price_history (commodity_id, market_id, date, open_price, high_price, low_price, close_price, volume)
SELECT 
  c.id, m.id, d.date,
  ROUND((20000 + (RANDOM() * 8000) - 4000)::numeric, -2),
  ROUND((24000 + (RANDOM() * 10000) - 3000)::numeric, -2),
  ROUND((17000 + (RANDOM() * 6000) - 4000)::numeric, -2),
  ROUND((21000 + (RANDOM() * 9000) - 4000)::numeric, -2),
  FLOOR(600 + RANDOM() * 2000)::integer
FROM commodities c
CROSS JOIN markets m
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as d(date)
WHERE c.name = 'Jeruk' AND m.name = 'Pasar Induk Kramat Jati'
ON CONFLICT (commodity_id, market_id, date) DO NOTHING;

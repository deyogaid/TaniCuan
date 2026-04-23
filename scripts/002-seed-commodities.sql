-- Seed data untuk komoditas populer di Indonesia

INSERT INTO commodities (name, category, unit, icon) VALUES
  ('Cabai Merah Keriting', 'bumbu', 'kg', 'pepper'),
  ('Cabai Rawit Merah', 'bumbu', 'kg', 'pepper'),
  ('Bawang Merah', 'bumbu', 'kg', 'onion'),
  ('Bawang Putih', 'bumbu', 'kg', 'garlic'),
  ('Tomat', 'sayur', 'kg', 'tomato'),
  ('Kentang', 'umbi', 'kg', 'potato'),
  ('Wortel', 'sayur', 'kg', 'carrot'),
  ('Kubis', 'sayur', 'kg', 'cabbage'),
  ('Buncis', 'sayur', 'kg', 'bean'),
  ('Jeruk', 'buah', 'kg', 'orange')
ON CONFLICT DO NOTHING;

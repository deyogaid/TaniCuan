-- Seed data untuk pasar induk utama di Indonesia

INSERT INTO markets (name, location, province, is_primary) VALUES
  ('Pasar Induk Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', true),
  ('Pasar Induk Tanah Tinggi', 'Tangerang', 'Banten', false),
  ('Pasar Induk Caringin', 'Bandung', 'Jawa Barat', true),
  ('Pasar Induk Giwangan', 'Yogyakarta', 'DIY', true),
  ('Pasar Induk Puspa Agro', 'Sidoarjo', 'Jawa Timur', true)
ON CONFLICT DO NOTHING;

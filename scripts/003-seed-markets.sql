-- Seed data untuk pasar induk utama di Indonesia dengan koordinat geografis

INSERT INTO markets (name, city, province, latitude, longitude, is_active, is_primary) VALUES
  ('Pasar Induk Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', -6.2371, 106.8829, true, true),
  ('Pasar Induk Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', -6.1869, 106.8105, true, false),
  ('Pasar Caringin', 'Bandung', 'Jawa Barat', -6.9132, 107.6147, true, true),
  ('Pasar Induk Giwangan', 'Yogyakarta', 'DIY', -7.8386, 110.4133, true, true),
  ('Pasar Induk Puspa Agro', 'Sidoarjo', 'Jawa Timur', -7.4628, 112.7190, true, true),
  ('Pasar Induk Benhil', 'Jakarta Pusat', 'DKI Jakarta', -6.2042, 106.8074, true, false),
  ('Pasar Induk Tangerang', 'Tangerang', 'Banten', -6.1799, 106.6312, true, false),
  ('Pasar Induk Lembang', 'Bandung', 'Jawa Barat', -6.8224, 107.6141, true, false),
  ('Pasar Induk Sleman', 'Sleman', 'DIY', -7.7452, 110.4123, true, false),
  ('Pasar Induk Karanganyar', 'Karanganyar', 'Jawa Tengah', -7.6333, 110.9833, true, false),
  ('Pasar Induk Balaraja', 'Tangerang', 'Banten', -6.2667, 106.5167, true, false),
  ('Pasar Induk Cipinang', 'Jakarta Timur', 'DKI Jakarta', -6.2200, 106.8800, true, false),
  ('Pasar Induk Cibubur', 'Jakarta Timur', 'DKI Jakarta', -6.3167, 106.9500, false, false),
  ('Pasar Induk Bogor', 'Bogor', 'Jawa Barat', -6.6024, 106.7942, true, false),
  ('Pasar Induk Sukabumi', 'Sukabumi', 'Jawa Barat', -6.9271, 107.0059, true, false)
ON CONFLICT DO NOTHING;

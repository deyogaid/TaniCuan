-- Seed data untuk komoditas populer di Indonesia

INSERT INTO commodities (name, category, unit, icon) VALUES
  -- Bumbu & Rempah
  ('Cabai Merah Keriting', 'bumbu', 'kg', 'pepper'),
  ('Cabai Rawit Merah', 'bumbu', 'kg', 'pepper'),
  ('Cabai Rawit Hijau', 'bumbu', 'kg', 'pepper'),
  ('Bawang Merah', 'bumbu', 'kg', 'onion'),
  ('Bawang Putih', 'bumbu', 'kg', 'garlic'),
  ('Kunyit', 'bumbu', 'kg', 'turmeric'),
  ('Jahe', 'bumbu', 'kg', 'ginger'),
  ('Lengkuas', 'bumbu', 'kg', 'galangal'),
  ('Kemiri', 'bumbu', 'kg', 'nut'),
  
  -- Sayur-mayur
  ('Tomat', 'sayur', 'kg', 'tomato'),
  ('Tomat Ceri', 'sayur', 'kg', 'tomato'),
  ('Wortel', 'sayur', 'kg', 'carrot'),
  ('Kubis', 'sayur', 'kg', 'cabbage'),
  ('Kubis Ungu', 'sayur', 'kg', 'cabbage'),
  ('Buncis', 'sayur', 'kg', 'bean'),
  ('Bayam', 'sayur', 'kg', 'spinach'),
  ('Kangkung', 'sayur', 'kg', 'water-spinach'),
  ('Selada', 'sayur', 'kg', 'lettuce'),
  ('Pepaya Muda', 'sayur', 'kg', 'papaya'),
  ('Terung', 'sayur', 'kg', 'eggplant'),
  ('Labu Siam', 'sayur', 'kg', 'squash'),
  ('Mentimun', 'sayur', 'kg', 'cucumber'),
  ('Brokoli', 'sayur', 'kg', 'broccoli'),
  ('Kol Bunga', 'sayur', 'kg', 'cauliflower'),
  
  -- Umbi & Akar
  ('Kentang', 'umbi', 'kg', 'potato'),
  ('Ubi Jalar', 'umbi', 'kg', 'sweet-potato'),
  ('Singkong', 'umbi', 'kg', 'cassava'),
  ('Talas', 'umbi', 'kg', 'taro'),
  ('Bit', 'umbi', 'kg', 'beetroot'),
  
  -- Buah-buahan
  ('Jeruk Manis', 'buah', 'kg', 'orange'),
  ('Jeruk Nipis', 'buah', 'kg', 'lime'),
  ('Jeruk Medan', 'buah', 'kg', 'orange'),
  ('Pisang Ambon', 'buah', 'kg', 'banana'),
  ('Pisang Mas', 'buah', 'kg', 'banana'),
  ('Mangga Gedong', 'buah', 'kg', 'mango'),
  ('Mangga Arumanis', 'buah', 'kg', 'mango'),
  ('Papaya', 'buah', 'kg', 'papaya'),
  ('Nanas', 'buah', 'kg', 'pineapple'),
  ('Semangka', 'buah', 'kg', 'watermelon'),
  ('Melon', 'buah', 'kg', 'melon'),
  ('Rambutan', 'buah', 'kg', 'rambutan'),
  ('Duku', 'buah', 'kg', 'duku'),
  ('Durian', 'buah', 'kg', 'durian'),
  ('Avokado', 'buah', 'kg', 'avocado'),
  ('Apel', 'buah', 'kg', 'apple'),
  ('Pear', 'buah', 'kg', 'pear'),
  ('Anggur', 'buah', 'kg', 'grape')
ON CONFLICT DO NOTHING;

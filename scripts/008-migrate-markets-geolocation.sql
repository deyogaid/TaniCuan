-- Migration script untuk menambahkan longitude/latitude ke markets
-- Jalankan script ini setelah 001-create-tables.sql

-- Step 1: Add new columns ke markets table (jika belum ada)
ALTER TABLE markets
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 2: Migrate data dari 'location' ke 'city' (jika ada)
UPDATE markets SET city = location WHERE city IS NULL AND location IS NOT NULL;

-- Step 3: Set default is_active to true untuk markets yang sudah ada
UPDATE markets SET is_active = true WHERE is_active IS NULL;

-- Step 4: Update koordinat untuk pasar-pasar utama yang sudah ada
UPDATE markets SET latitude = -6.2371, longitude = 106.8829 
  WHERE name = 'Pasar Induk Kramat Jati' AND latitude IS NULL;
UPDATE markets SET latitude = -6.1869, longitude = 106.8105 
  WHERE name = 'Pasar Induk Tanah Abang' AND latitude IS NULL;
UPDATE markets SET latitude = -6.9132, longitude = 107.6147 
  WHERE name = 'Pasar Caringin' AND latitude IS NULL;
UPDATE markets SET latitude = -7.8386, longitude = 110.4133 
  WHERE name = 'Pasar Induk Giwangan' AND latitude IS NULL;
UPDATE markets SET latitude = -7.4628, longitude = 112.7190 
  WHERE name = 'Pasar Induk Puspa Agro' AND latitude IS NULL;
UPDATE markets SET latitude = -6.1799, longitude = 106.6312 
  WHERE name = 'Pasar Induk Tangerang' AND latitude IS NULL;

-- Step 5: Create index untuk koordinat (untuk query geospatial)
CREATE INDEX IF NOT EXISTS idx_markets_coordinates ON markets(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_markets_is_active ON markets(is_active);

-- Verify migration
SELECT id, name, city, province, latitude, longitude, is_active FROM markets LIMIT 5;

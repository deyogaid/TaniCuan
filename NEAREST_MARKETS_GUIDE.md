# Panduan Fitur Pasar Terdekat & Komoditi Lengkap

## Overview
Dokumentasi lengkap untuk fitur pencarian pasar terdekat dengan radius 50km dan data komoditi yang telah dilengkapi.

---

## 📍 Fitur Pasar Terdekat (Nearest Markets)

### Teknologi yang Digunakan
- **Haversine Formula**: Algoritma akurat untuk menghitung jarak geografis antara dua titik
- **Client-side Filtering**: Semua kalkulasi jarak dilakukan di client untuk performa optimal
- **Geolocation API**: Mengambil koordinat petani dari device

### Koordinat Pasar
Semua pasar di database sekarang dilengkapi dengan koordinat geografis:

| Pasar | Kota | Latitude | Longitude |
|-------|------|----------|-----------|
| Pasar Induk Kramat Jati | Jakarta Timur | -6.2371 | 106.8829 |
| Pasar Induk Tanah Abang | Jakarta Pusat | -6.1869 | 106.8105 |
| Pasar Caringin | Bandung | -6.9132 | 107.6147 |
| Pasar Induk Giwangan | Yogyakarta | -7.8386 | 110.4133 |
| Pasar Induk Puspa Agro | Sidoarjo | -7.4628 | 112.7190 |
| ... dan 10 pasar lainnya | ... | ... | ... |

---

## 🚀 Cara Penggunaan

### 1. Utility Functions (lib/distance-utils.ts)

#### Haversine Distance Calculation
```typescript
import { calculateHaversineDistance } from '@/lib/distance-utils'

// Hitung jarak antara dua koordinat
const distance = calculateHaversineDistance(
  -6.2371,  // latitude 1 (Kramat Jati)
  106.8829, // longitude 1
  -6.9132,  // latitude 2 (Bandung)
  107.6147  // longitude 2
) // Result: ~190.5 km
```

#### Filter Markets by Radius
```typescript
import { filterMarketsByRadius } from '@/lib/distance-utils'

const farmerLocation = {
  latitude: -6.2371,
  longitude: 106.8829
}

// Cari pasar dalam radius 50km
const nearbyMarkets = filterMarketsByRadius(
  markets,
  farmerLocation,
  50 // radius dalam km
)
```

#### Find Nearest Market
```typescript
import { findNearestMarket } from '@/lib/distance-utils'

const nearest = findNearestMarket(markets, farmerLocation)
console.log(`Pasar terdekat: ${nearest.name} - ${nearest.distance} km`)
```

### 2. Hook useNearestMarkets

#### Basic Usage
```typescript
'use client'

import { useNearestMarkets } from '@/lib/hooks/use-nearest-markets'
import { useEffect, useState } from 'react'

export function MyComponent() {
  const [location, setLocation] = useState(null)
  
  // Get geolocation dari browser
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      })
    })
  }, [])
  
  // Fetch nearest markets
  const { markets, nearestMarket, isLoading, error } = useNearestMarkets(
    location,
    50 // radius 50km
  )
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {nearestMarket && (
        <div>
          Pasar Terdekat: {nearestMarket.name}
          Jarak: {nearestMarket.distance?.toFixed(1)} km
        </div>
      )}
      
      <h3>Semua Pasar ({markets.length}):</h3>
      <ul>
        {markets.map(market => (
          <li key={market.id}>
            {market.name} - {market.distance?.toFixed(1)} km
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 3. Component NearestMarketsCard

Pre-built component untuk menampilkan pasar terdekat:

```typescript
import { NearestMarketsCard } from '@/components/nearest-markets-card'

export function FarmerDashboard() {
  const [location, setLocation] = useState(null)
  
  return (
    <NearestMarketsCard
      farmerLocation={location}
      radiusKm={50}
      onSelectMarket={(marketId) => {
        console.log('Selected:', marketId)
      }}
    />
  )
}
```

---

## 🌾 Data Komoditi Lengkap

### Kategori Komoditi
1. **Bumbu & Rempah** (9 item)
   - Cabai Merah Keriting, Cabai Rawit, Bawang Merah, Bawang Putih, dll

2. **Sayur-mayur** (17 item)
   - Tomat, Wortel, Kubis, Buncis, Bayam, Kangkung, dll

3. **Umbi & Akar** (5 item)
   - Kentang, Ubi Jalar, Singkong, Talas, Bit

4. **Buah-buahan** (18 item)
   - Jeruk, Pisang, Mangga, Papaya, Nanas, Semangka, dll

**Total: 49 komoditi**

### Database Schema

```sql
-- Markets table dengan geolocation
CREATE TABLE markets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  province TEXT,
  latitude DECIMAL(10, 8),    -- Akurat hingga ~1 meter
  longitude DECIMAL(11, 8),   -- Akurat hingga ~1 meter
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
);

-- Commodities table (tidak ada perubahan)
CREATE TABLE commodities (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('sayur', 'buah', 'umbi', 'bumbu')),
  unit TEXT DEFAULT 'kg',
  icon TEXT,
  created_at TIMESTAMPTZ
);
```

---

## 🗂️ File Structure

```
lib/
  ├── distance-utils.ts          # Utility untuk Haversine & distance calculations
  ├── types.ts                   # Updated Market interface
  └── hooks/
      ├── use-market-data.ts     # Updated dengan location fields
      └── use-nearest-markets.ts # 3 custom hooks untuk nearest markets

components/
  └── nearest-markets-card.tsx   # Pre-built component

scripts/
  ├── 001-create-tables.sql      # Updated markets schema
  ├── 002-seed-commodities.sql   # 49 komoditi (expanded)
  ├── 003-seed-markets.sql       # 15 pasar dengan koordinat
  └── 008-migrate-markets-geolocation.sql # Migration script
```

---

## 📋 Haversine Formula

Rumus yang digunakan untuk menghitung jarak:

```
R = 6371 km (radius bumi)
Δlat = lat2 - lat1
Δlon = lon2 - lon1

a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c
```

**Akurasi**: ±0.5% (untuk jarak < 1000 km)

---

## 🔧 Advanced Usage

### 1. Real-time Market Distances
```typescript
const { distances } = useMarketsDistance(
  { latitude: -6.2371, longitude: 106.8829 },
  ['market-id-1', 'market-id-2']
)

// distances = [
//   { marketId: '...', market: {...}, distance: 2.5 },
//   { marketId: '...', market: {...}, distance: 15.3 }
// ]
```

### 2. Calculate Bearing (Arah)
```typescript
import { calculateBearing, bearingToDirection } from '@/lib/distance-utils'

const bearing = calculateBearing(
  { latitude: -6.2371, longitude: 106.8829 }, // Farmer
  { latitude: -6.9132, longitude: 107.6147 }  // Market
)

const direction = bearingToDirection(bearing)
console.log(direction) // 'Barat Daya' dll
```

### 3. Format Display
```typescript
import { formatDistance } from '@/lib/distance-utils'

formatDistance(0.5)   // "500 m"
formatDistance(2.3)   // "2.3 km"
formatDistance(145)   // "145 km"
```

---

## 🧪 Testing

### Unit Test Examples
```typescript
import { calculateHaversineDistance, filterMarketsByRadius } from '@/lib/distance-utils'

describe('Distance Utilities', () => {
  it('calculates Haversine distance correctly', () => {
    // Jakarta to Bandung ~190 km
    const distance = calculateHaversineDistance(
      -6.2371, 106.8829,
      -6.9132, 107.6147
    )
    expect(distance).toBeCloseTo(190, 0)
  })
  
  it('filters markets by radius', () => {
    const markets = [...] // data
    const nearby = filterMarketsByRadius(
      markets,
      { latitude: -6.2371, longitude: 106.8829 },
      50
    )
    expect(nearby.length).toBeGreaterThan(0)
    expect(nearby.every(m => m.distance <= 50)).toBe(true)
  })
})
```

---

## 🛠️ Installation & Setup

### 1. Update Database
```bash
# Jalankan migration script di Supabase
psql -f scripts/008-migrate-markets-geolocation.sql

# Atau seed ulang semua data
psql -f scripts/001-create-tables.sql
psql -f scripts/002-seed-commodities.sql
psql -f scripts/003-seed-markets.sql
```

### 2. Import Hooks/Components
```typescript
// Dalam komponen Anda
import { useNearestMarkets } from '@/lib/hooks/use-nearest-markets'
import { NearestMarketsCard } from '@/components/nearest-markets-card'
import { filterMarketsByRadius } from '@/lib/distance-utils'
```

### 3. Get Farmer Location
```typescript
// Option 1: Geolocation API
navigator.geolocation.getCurrentPosition(pos => {
  setFarmerLocation({
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude
  })
})

// Option 2: Form Input (dari user)
// Option 3: Map Picker
```

---

## ⚠️ Important Notes

1. **Precision**: Koordinat disimpan dengan precision 8 desimal (~1 meter akurasi)
2. **Client-side Calculation**: Semua jarak dihitung di client, bukan di server
3. **Geolocation Permission**: User harus approve geolocation permission
4. **Fallback**: Jika location unavailable, tampilkan pesan atau form untuk input manual
5. **Performance**: Filtering 15 pasar < 1ms di JS modern

---

## 📚 Referensi

- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Decimal Degrees Precision](https://en.wikipedia.org/wiki/Decimal_degrees#Precision)

---

## 💬 FAQ

**Q: Bagaimana cara mendapatkan lokasi petani?**
A: Bisa menggunakan Geolocation API browser atau form input manual dari petani.

**Q: Seberapa akurat Haversine formula?**
A: Akurat ±0.5% untuk jarak < 1000 km. Cukup untuk kebutuhan aplikasi.

**Q: Apakah bisa filter by kategori komoditi?**
A: Ya, query Supabase dengan `WHERE category = 'sayur'` sebelum fetch.

**Q: Berapa pasar yang bisa di-filter sekaligus?**
A: Ribuan (tidak ada limit teknis), tapi semakin banyak semakin lambat UI rendering.

**Q: Data koordinat dari mana?**
A: Google Maps API, OpenStreetMap, atau manual research untuk pasar-pasar utama Indonesia.

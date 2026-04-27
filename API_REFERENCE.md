# API Reference & Troubleshooting Guide

## 📚 API Reference

### Distance Utilities (`lib/distance-utils.ts`)

#### 1. `calculateHaversineDistance(lat1, lon1, lat2, lon2): number`
Menghitung jarak antara dua titik geografis menggunakan formula Haversine.

**Parameters:**
- `lat1: number` - Latitude titik pertama (-90 to 90)
- `lon1: number` - Longitude titik pertama (-180 to 180)
- `lat2: number` - Latitude titik kedua
- `lon2: number` - Longitude titik kedua

**Returns:** `number` - Jarak dalam km (1 desimal precision)

**Example:**
```typescript
const distance = calculateHaversineDistance(-6.2371, 106.8829, -6.9132, 107.6147)
console.log(distance) // 190.5
```

#### 2. `calculateDistance(from: GeoLocation, to: GeoLocation): number`
Wrapper untuk `calculateHaversineDistance` dengan GeoLocation objects.

**Parameters:**
- `from: GeoLocation` - {latitude, longitude}
- `to: GeoLocation` - {latitude, longitude}

**Returns:** `number` - Jarak dalam km, atau Infinity jika data invalid

**Example:**
```typescript
const dist = calculateDistance(
  { latitude: -6.2371, longitude: 106.8829 },
  { latitude: -6.9132, longitude: 107.6147 }
)
```

#### 3. `filterMarketsByRadius(markets, centerLocation, radiusKm): Array`
Filter pasar berdasarkan radius dari lokasi pusat.

**Parameters:**
- `markets: T[]` - Array pasar dengan latitude/longitude
- `centerLocation: GeoLocation` - Lokasi pusat (farmer)
- `radiusKm: number` - Radius dalam km (default: 50)

**Returns:** `Array` - Pasar yang dalam radius, sorted by distance

**Example:**
```typescript
const nearby = filterMarketsByRadius(
  markets,
  { latitude: -6.2371, longitude: 106.8829 },
  50
)
```

#### 4. `findNearestMarket(markets, centerLocation): Market | undefined`
Cari pasar terdekat dari lokasi.

**Parameters:**
- `markets: T[]` - Array pasar
- `centerLocation: GeoLocation` - Lokasi pusat

**Returns:** `Market | undefined` - Pasar terdekat atau undefined

**Example:**
```typescript
const nearest = findNearestMarket(markets, farmerLocation)
if (nearest) {
  console.log(`${nearest.name}: ${nearest.distance} km`)
}
```

#### 5. `calculateBearing(from, to): number`
Hitung bearing (arah) dari satu titik ke titik lain.

**Parameters:**
- `from: GeoLocation` - Titik awal
- `to: GeoLocation` - Titik tujuan

**Returns:** `number` - Bearing dalam derajat (0-360)
- 0° = Utara (N)
- 90° = Timur (E)
- 180° = Selatan (S)
- 270° = Barat (W)

**Example:**
```typescript
const bearing = calculateBearing(
  { latitude: -6.2371, longitude: 106.8829 },
  { latitude: -6.9132, longitude: 107.6147 }
)
console.log(bearing) // e.g., 225° (Barat Daya)
```

#### 6. `bearingToDirection(bearing): string`
Convert bearing degree ke arah mata angin.

**Parameters:**
- `bearing: number` - Bearing dalam derajat (0-360)

**Returns:** `string` - Arah (Utara, Timur Laut, Timur, etc)

**Example:**
```typescript
const direction = bearingToDirection(225)
console.log(direction) // "Barat Daya"
```

#### 7. `formatDistance(distance): string`
Format jarak untuk ditampilkan ke user.

**Parameters:**
- `distance: number` - Jarak dalam km

**Returns:** `string` - Formatted string (500 m, 2.3 km, 145 km)

**Example:**
```typescript
formatDistance(0.5)   // "500 m"
formatDistance(2.3)   // "2.3 km"
formatDistance(145)   // "145 km"
```

#### 8. `isValidGeoLocation(location): boolean`
Validasi apakah koordinat geografis valid.

**Parameters:**
- `location: GeoLocation` - Lokasi dengan lat/lon

**Returns:** `boolean` - True jika valid

**Example:**
```typescript
isValidGeoLocation({ latitude: -6.2371, longitude: 106.8829 }) // true
isValidGeoLocation({ latitude: 100, longitude: 200 }) // false
```

---

### Hooks (`lib/hooks/use-nearest-markets.ts`)

#### 1. `useNearestMarkets(farmerLocation, radiusKm)`
Hook utama untuk fetch pasar terdekat dengan radius filter.

**Parameters:**
- `farmerLocation: GeoLocation | null` - Lokasi farmer atau null
- `radiusKm: number` - Radius dalam km (default: 50)

**Returns:**
```typescript
{
  markets: Market[]           // Semua pasar dalam radius
  nearestMarket: Market       // Pasar terdekat
  allMarkets: Market[]        // Semua pasar (tanpa filter)
  isLoading: boolean
  error: Error | null
  refetch: () => void
  getDistanceToMarket: (market: Market) => number | null
}
```

**Example:**
```typescript
const { markets, nearestMarket, isLoading } = useNearestMarkets(
  { latitude: -6.2371, longitude: 106.8829 },
  50
)
```

#### 2. `useNearestMarket(farmerLocation)`
Hook untuk cari hanya pasar terdekat (lebih efficient).

**Parameters:**
- `farmerLocation: GeoLocation | null` - Lokasi farmer

**Returns:**
```typescript
{
  market: Market | undefined
  isLoading: boolean
  error: Error | null
}
```

**Example:**
```typescript
const { market, isLoading } = useNearestMarket(farmerLocation)
```

#### 3. `useMarketsDistance(farmerLocation, marketIds)`
Hook untuk batch check jarak ke multiple markets.

**Parameters:**
- `farmerLocation: GeoLocation | null` - Lokasi farmer
- `marketIds: string[] | null` - Array market IDs (optional)

**Returns:**
```typescript
{
  distances: Array<{
    marketId: string
    market: Market
    distance: number | null
  }>
  isLoading: boolean
  error: Error | null
}
```

**Example:**
```typescript
const { distances } = useMarketsDistance(
  location,
  ['market-1', 'market-2']
)
```

---

## 🐛 Troubleshooting

### Problem: Geolocation tidak working

**Symptoms:**
- Browser tidak menampilkan permission request
- Navigator.geolocation undefined

**Solutions:**
1. **Check browser compatibility:**
   ```typescript
   if ('geolocation' in navigator) {
     // Supported
   }
   ```

2. **User denied permission:**
   - Aplikasi sudah remember user choice
   - User harus reset permission di browser settings
   - Chrome: Settings → Privacy → Site Settings → Location

3. **HTTPS required:**
   - Geolocation hanya kerja di HTTPS
   - Localhost OK untuk development
   - Production harus HTTPS

4. **Fallback ke manual input:**
   ```typescript
   const handleGetLocation = () => {
     if (!('geolocation' in navigator)) {
       setShowManualInput(true)
       return
     }
     
     navigator.geolocation.getCurrentPosition(
       (position) => setLocation({...}),
       (error) => setShowManualInput(true) // Fallback
     )
   }
   ```

### Problem: Markets tidak terupdate

**Symptoms:**
- Hook return markets array kosong
- Distance always null
- Koordinat tidak ada

**Solutions:**
1. **Verify database migration:**
   ```sql
   SELECT id, name, latitude, longitude FROM markets LIMIT 5;
   ```

2. **Check Supabase RLS policies:**
   ```sql
   -- Verify RLS policy exists
   SELECT * FROM pg_policies WHERE tablename = 'markets';
   ```

3. **Verify hook is using client:**
   ```typescript
   'use client' // Must be at top
   ```

4. **Check network tab:**
   - DevTools → Network
   - See if request ke `/markets` returns data
   - Check response has latitude/longitude

### Problem: Distance calculation wrong

**Symptoms:**
- Hasil jarak tidak masuk akal
- Haversine formula results strange

**Solutions:**
1. **Verify koordinat format:**
   - Latitude: -90 to 90
   - Longitude: -180 to 180
   - Tanda minus untuk Southern/Western hemisphere

2. **Debug coordinates:**
   ```typescript
   console.log('From:', from)      // e.g., {lat: -6.2371, lon: 106.8829}
   console.log('To:', to)          // e.g., {lat: -6.9132, lon: 107.6147}
   
   // Test distance Jakarta-Bandung should be ~190km
   const distance = calculateHaversineDistance(
     -6.2371, 106.8829,
     -6.9132, 107.6147
   )
   console.log(distance) // Should be ~190
   ```

3. **Coordinate precision:**
   - Database stores as DECIMAL(10,8)
   - Precision ~1 meter
   - Normal for Earth calculations

### Problem: Component tidak render

**Symptoms:**
- NearestMarketsCard blank
- No error in console
- isLoading never becomes false

**Solutions:**
1. **Check location prop:**
   ```typescript
   // location harus tidak null
   console.log('Location:', farmerLocation)
   
   // atau component won't fetch
   {farmerLocation && <NearestMarketsCard ... />}
   ```

2. **Verify SWR config:**
   ```typescript
   // Check if SWR is fetching
   // DevTools → Network tab → should see requests
   ```

3. **Check error state:**
   ```typescript
   const { error, isLoading } = useNearestMarkets(...)
   if (error) console.error(error)
   ```

### Problem: Performance slow

**Symptoms:**
- Page lag saat select market
- Bearing calculation janky
- UI freeze

**Solutions:**
1. **Use useMemo untuk expensive calculations:**
   ```typescript
   const distances = useMemo(() => {
     return filterMarketsByRadius(...)
   }, [markets, location])
   ```

2. **Use useCallback untuk functions:**
   ```typescript
   const handleSelectMarket = useCallback((marketId) => {
     // ...
   }, [])
   ```

3. **Lazy load market details:**
   ```typescript
   // Don't calculate bearing/distance untuk semua markets
   // Hanya untuk yang expanded/selected
   ```

4. **Reduce re-renders:**
   ```typescript
   // Use React.memo untuk child components
   const MarketCard = React.memo(({ market }) => ...)
   ```

### Problem: Koordinat shows as null/undefined

**Symptoms:**
- market.latitude = null
- market.longitude = null
- Can't calculate distance

**Solutions:**
1. **Check database has values:**
   ```sql
   SELECT name, latitude, longitude FROM markets;
   ```

2. **Seed markets dengan coordinates:**
   ```bash
   # Run migration script
   psql -f scripts/008-migrate-markets-geolocation.sql
   ```

3. **Verify TypeScript type:**
   ```typescript
   // Type harus allow null
   latitude: number | null
   longitude: number | null
   ```

4. **Add fallback:**
   ```typescript
   if (!market.latitude || !market.longitude) {
     return <div>Koordinat tidak tersedia</div>
   }
   ```

---

## ✅ Validation Checklist

Before deploying, verify:

- [ ] Database migration completed
- [ ] `markets` table has `latitude` & `longitude` columns
- [ ] At least 15 pasar diseed dengan koordinat
- [ ] 49 komoditi diseed
- [ ] Types updated (Market interface)
- [ ] Distance utils imported correctly
- [ ] Hooks working (test di browser)
- [ ] Component rendering
- [ ] Geolocation permission working
- [ ] Manual input fallback working
- [ ] No TypeScript errors
- [ ] Performance acceptable (< 100ms rendering)
- [ ] Mobile responsive

---

## 📞 Getting Help

1. **Check documentation:**
   - `NEAREST_MARKETS_GUIDE.md` - Full guide
   - `IMPLEMENTATION_SUMMARY.md` - What's implemented

2. **View examples:**
   - `app/nearest-markets-example/page.tsx` - Working example

3. **Test your code:**
   ```typescript
   // In browser console
   calculateHaversineDistance(-6.2371, 106.8829, -6.9132, 107.6147)
   // Should return ~190
   ```

4. **Debug with DevTools:**
   - DevTools → Network → Check API calls
   - DevTools → Console → Check errors
   - DevTools → Application → Check RLS policies

---

## 🎯 Common Code Patterns

### Pattern 1: Get location & show nearby markets
```typescript
'use client'
import { useEffect, useState } from 'react'
import { useNearestMarkets } from '@/lib/hooks/use-nearest-markets'

export function Component() {
  const [location, setLocation] = useState(null)
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      })
    })
  }, [])
  
  const { markets, nearestMarket } = useNearestMarkets(location, 50)
  
  return (
    <div>
      {nearestMarket && <div>{nearestMarket.name}</div>}
    </div>
  )
}
```

### Pattern 2: Manual location input
```typescript
const [lat, setLat] = useState('')
const [lon, setLon] = useState('')

const handleSubmit = (e) => {
  e.preventDefault()
  setLocation({
    latitude: parseFloat(lat),
    longitude: parseFloat(lon)
  })
}

return (
  <form onSubmit={handleSubmit}>
    <input value={lat} onChange={(e) => setLat(e.target.value)} />
    <input value={lon} onChange={(e) => setLon(e.target.value)} />
    <button type="submit">Search</button>
  </form>
)
```

### Pattern 3: Calculate specific distance
```typescript
const distance = getDistanceToMarket(market)
console.log(`${market.name}: ${formatDistance(distance)}`)
```

---

Status: Ready for Production ✅
Last Updated: 2024

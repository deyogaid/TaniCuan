#!/bin/bash

# 🚀 QUICK START GUIDE - Nearest Markets Feature
# Copy-paste commands untuk setup cepat

echo "🎯 TaniCuan - Nearest Markets Feature Setup"
echo "=================================================="
echo ""

# 1. Backup existing data (optional)
echo "📦 Step 1: Backup database (optional)..."
echo "# Create backup dari Supabase dashboard"
echo ""
npm 
# 2. Run migrations
echo "🔧 Step 2: Run database migrations..."
echo "# Di Supabase SQL editor, jalankan:"
echo "# 1. scripts/001-create-tables.sql"
echo "# 2. scripts/002-seed-commodities.sql"
echo "# 3. scripts/003-seed-markets.sql"
echo "# 4. scripts/008-migrate-markets-geolocation.sql"
echo ""

# 3. Copy files to project
echo "📄 Step 3: Verify files copied..."
ls -la lib/distance-utils.ts
ls -la lib/hooks/use-nearest-markets.ts
ls -la components/nearest-markets-card.tsx
ls -la app/nearest-markets-example/page.tsx
echo ""

# 4. Development server
echo "🚀 Step 4: Start development server..."
echo "$ npm run dev"
echo "# atau"
echo "$ pnpm dev"
echo ""

# 5. Test example page
echo "✅ Step 5: Test example page..."
echo "# Visit: http://localhost:3000/nearest-markets-example"
echo ""

# 6. Integration checklist
echo "📋 Step 6: Integration Checklist"
echo "========================================"
echo ""
echo "Database:"
echo "  [ ] Database schema updated (markets table)"
echo "  [ ] 49 komoditi diseed"
echo "  [ ] 15 pasar dengan koordinat diseed"
echo ""
echo "Code:"
echo "  [ ] lib/types.ts - Market interface updated"
echo "  [ ] lib/distance-utils.ts - Haversine functions"
echo "  [ ] lib/hooks/use-nearest-markets.ts - Custom hooks"
echo "  [ ] components/nearest-markets-card.tsx - Component"
echo "  [ ] lib/hooks/use-market-data.ts - Updated fetchMarkets()"
echo ""
echo "Documentation:"
echo "  [ ] NEAREST_MARKETS_GUIDE.md - Read for details"
echo "  [ ] IMPLEMENTATION_SUMMARY.md - See what's done"
echo "  [ ] app/nearest-markets-example/page.tsx - Example usage"
echo ""

# 7. Common issues
echo "⚠️  Common Issues & Solutions"
echo "========================================"
echo ""
echo "Issue: Geolocation permission denied"
echo "Solution: Check browser geolocation settings, use manual input"
echo ""
echo "Issue: Coordinates showing as null"
echo "Solution: Verify database migration completed, check Supabase"
echo ""
echo "Issue: Markets not filtering correctly"
echo "Solution: Check GeoLocation object has latitude/longitude"
echo ""

# 8. Usage examples
echo ""
echo "💻 Quick Code Examples"
echo "========================================"
echo ""
echo "1. Get nearest markets:"
echo "---"
cat << 'EOF'
import { useNearestMarkets } from '@/lib/hooks/use-nearest-markets'

const { markets, nearestMarket } = useNearestMarkets(
  { latitude: -6.2371, longitude: 106.8829 },
  50 // radius km
)
EOF
echo "---"
echo ""

echo "2. Use component:"
echo "---"
cat << 'EOF'
import { NearestMarketsCard } from '@/components/nearest-markets-card'

<NearestMarketsCard
  farmerLocation={location}
  radiusKm={50}
  onSelectMarket={(id) => console.log(id)}
/>
EOF
echo "---"
echo ""

echo "3. Calculate distance:"
echo "---"
cat << 'EOF'
import { calculateHaversineDistance } from '@/lib/distance-utils'

const distance = calculateHaversineDistance(
  -6.2371, 106.8829,  // Jakarta
  -6.9132, 107.6147   // Bandung
)
console.log(distance) // ~190 km
EOF
echo "---"
echo ""

# 9. Testing
echo "🧪 Testing"
echo "========================================"
echo ""
echo "Test Coordinates (untuk manual testing):"
echo ""
echo "Jakarta:      -6.2371, 106.8829"
echo "Bandung:      -6.9132, 107.6147"
echo "Yogyakarta:   -7.8386, 110.4133"
echo "Sidoarjo:     -7.4628, 112.7190"
echo ""

# 10. Performance notes
echo "⚡ Performance Notes"
echo "========================================"
echo ""
echo "• Distance calculation: < 1ms per market"
echo "• Filter 15 markets in radius: < 1ms total"
echo "• No database queries needed for filtering"
echo "• All calculations on client-side"
echo ""

# 11. Next steps
echo "📚 Next Steps"
echo "========================================"
echo ""
echo "1. Read NEAREST_MARKETS_GUIDE.md for full documentation"
echo "2. Visit /nearest-markets-example for interactive demo"
echo "3. Integrate NearestMarketsCard into farmer dashboard"
echo "4. Customize component styling to match your design"
echo "5. Connect farmer location to profile/settings"
echo ""

echo "✅ Setup complete!"
echo "Happy coding! 🎉"

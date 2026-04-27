'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMarkets, useDashboardData } from '@/lib/hooks/use-market-data'
import { MarketSelector } from '@/components/market-selector'
import { CommodityCard } from '@/components/commodity-card'
import { DashboardHeader } from '@/components/dashboard-header'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { PriceAlerts } from '@/components/price-alerts'
import { MobileNav } from '@/components/mobile-nav'
import { MarketOverview } from '@/components/market-overview'
import { RecentTransactions } from '@/components/recent-transactions'
import { NearestMarketsCard } from '@/components/nearest-markets-card'
import { CommodityDetailSheet } from '@/components/commodity-detail-sheet'
import { AIPredictionChat } from '@/components/ai-prediction-chat'
import type { Market, CommodityPriceData } from '@/lib/types'
import type { GeoLocation } from '@/lib/distance-utils'
import { RefreshCw, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityPriceData | undefined>(undefined)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [farmerLocation, setFarmerLocation] = useState<GeoLocation | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)

  // Get farmer geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setGeoLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFarmerLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setGeoLoading(false)
        },
        (error) => {
          console.warn('Geolocation error:', error)
          setGeoLoading(false)
        }
      )
    }
  }, [])

  // Fetch markets
  const { data: markets, isLoading: loadingMarkets } = useMarkets()

  // Set default market when loaded
  useEffect(() => {
    if (markets && markets.length > 0 && !selectedMarket) {
      const primaryMarket = markets.find(m => m.is_primary) || markets[0]
      setSelectedMarket(primaryMarket)
    }
  }, [markets, selectedMarket])

  // Fetch dashboard data for selected market
  const { commodityData, isLoading, error, refresh } = useDashboardData(selectedMarket?.id || null)

  const handleCommodityClick = (data: CommodityPriceData) => {
    setSelectedCommodity(data)
    setIsSheetOpen(true)
  }

  const handleRefresh = () => {
    refresh()
  }

  const handleTabChange = (tab: string) => {
    if (tab === 'analysis') {
      router.push('/analysis')
    } else if (tab === 'community') {
      router.push('/community')
    } else if (tab === 'alerts') {
      // TODO: implement alerts page
    } else if (tab === 'profile') {
      router.push('/profile')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isLoading} />

      {/* Main Content */}
      <main className="flex-1 px-4 pb-20">
        {/* Market Selector */}
        <section className="py-4">
          {loadingMarkets ? (
            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-24 bg-muted rounded-full animate-pulse" />
              ))}
            </div>
          ) : markets && markets.length > 0 ? (
            <MarketSelector
              markets={markets}
              selectedMarket={selectedMarket}
              onSelectMarket={setSelectedMarket}
            />
          ) : null}
        </section>

        {/* Nearest Markets Section */}
        <section className="py-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Pasar Terdekat</h2>
              {geoLoading && (
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground ml-2" />
              )}
            </div>
            {!farmerLocation && !geoLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGeoLoading(true)
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setFarmerLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                      })
                      setGeoLoading(false)
                    },
                    () => setGeoLoading(false)
                  )
                }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Aktifkan Lokasi
              </Button>
            )}
          </div>
          <NearestMarketsCard
            farmerLocation={farmerLocation}
            radiusKm={50}
            onSelectMarket={(marketId) => {
              const market = markets?.find(m => m.id === marketId)
              if (market) {
                setSelectedMarket(market)
              }
            }}
          />
        </section>

        {/* Market Overview */}
        {!isLoading && selectedMarket && commodityData.length > 0 && (
          <section className="mb-4">
            <MarketOverview market={selectedMarket} commodityData={commodityData} />
          </section>
        )}

        {/* Summary Stats */}
        {!isLoading && commodityData.length > 0 && (
          <section className="mb-4">
            <SummaryStats data={commodityData} />
          </section>
        )}

        {/* Recent Transactions */}
        {!isLoading && selectedMarket && (
          <section className="mb-4">
            <RecentTransactions marketId={selectedMarket.id} />
          </section>
        )}

        {/* Price Alerts */}
        {!isLoading && commodityData.length > 0 && (
          <section className="mb-4">
            <PriceAlerts data={commodityData} />
          </section>
        )}

        {/* Commodity Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Harga Komoditas</h2>
            {isLoading && (
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Gagal memuat data</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-primary underline text-sm"
              >
                Coba lagi
              </button>
            </div>
          ) : commodityData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Belum ada data harga</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {commodityData.map(data => (
                <CommodityCard
                  key={data.commodity.id}
                  data={data}
                  onClick={() => handleCommodityClick(data)}
                  isSelected={selectedCommodity?.commodity.id === data.commodity.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Commodity Detail Sheet */}
      <CommodityDetailSheet
        data={selectedCommodity}
        marketId={selectedMarket?.id || null}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* AI Prediction Chat */}
      {isAIChatOpen && (
        <div className="fixed bottom-24 right-4 z-40 w-full max-w-md md:w-96">
          <AIPredictionChat
            commodityData={selectedCommodity}
            isOpen={isAIChatOpen}
            onClose={() => setIsAIChatOpen(false)}
          />
        </div>
      )}

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="flex gap-2 p-2 bg-background border-t border-border">
          <button
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-shadow"
            title="Buka chat prediksi AI"
          >
            🤖 AI Analisis
          </button>
        </div>
        <MobileNav activeTab="home" onTabChange={handleTabChange} />
      </div>
    </div>
  )
}

// Summary statistics component
function SummaryStats({ data }: { data: CommodityPriceData[] }) {
  const greenCount = data.filter(d => d.signal.signal === 'green').length
  const yellowCount = data.filter(d => d.signal.signal === 'yellow').length
  const redCount = data.filter(d => d.signal.signal === 'red').length

  return (
    <div className="flex gap-3 p-3 bg-card rounded-lg border">
      <StatItem
        color="bg-[oklch(0.6_0.18_145)]"
        label="Tahan"
        count={greenCount}
      />
      <StatItem
        color="bg-[oklch(0.75_0.15_85)]"
        label="Tunggu"
        count={yellowCount}
      />
      <StatItem
        color="bg-[oklch(0.55_0.22_25)]"
        label="Jual"
        count={redCount}
      />
    </div>
  )
}

function StatItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <div className="text-sm">
        <span className="font-bold">{count}</span>
        <span className="text-muted-foreground ml-1">{label}</span>
      </div>
    </div>
  )
}


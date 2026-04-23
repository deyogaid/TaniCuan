'use client'

import { useState, useEffect } from 'react'
import { useMarkets, useDashboardData } from '@/lib/hooks/use-market-data'
import { MarketPills } from '@/components/market-selector'
import { CommodityCard } from '@/components/commodity-card'
import { CommodityDetailSheet } from '@/components/commodity-detail-sheet'
import { DashboardHeader } from '@/components/dashboard-header'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { MobileNav } from '@/components/mobile-nav'
import type { Market, CommodityPriceData } from '@/lib/types'
import { RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityPriceData | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

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
            <MarketPills
              markets={markets}
              selectedMarket={selectedMarket}
              onSelectMarket={setSelectedMarket}
            />
          ) : null}
        </section>

        {/* Summary Stats */}
        {!isLoading && commodityData.length > 0 && (
          <section className="mb-4">
            <SummaryStats data={commodityData} />
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
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* Mobile Navigation */}
      <MobileNav activeTab="home" />
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

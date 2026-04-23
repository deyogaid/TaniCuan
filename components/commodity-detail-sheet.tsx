'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import type { CommodityPriceData } from '@/lib/types'
import { formatRupiah, formatPercent, formatDate } from '@/lib/types'
import { CandlestickChart } from './candlestick-chart'
import { TrafficLightSignal } from './traffic-light-signal'
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommodityDetailSheetProps {
  data: CommodityPriceData | null
  isOpen: boolean
  onClose: () => void
}

export function CommodityDetailSheet({
  data,
  isOpen,
  onClose,
}: CommodityDetailSheetProps) {
  if (!data) return null

  const { commodity, latestPrice, priceChangePercent, signal, ohlcData } = data
  const isPositive = priceChangePercent >= 0

  // Calculate stats
  const weekData = ohlcData.slice(-7)
  const weekHigh = Math.max(...weekData.map(d => d.high))
  const weekLow = Math.min(...weekData.map(d => d.low))
  const avgVolume = Math.round(weekData.reduce((sum, d) => sum + d.volume, 0) / weekData.length)

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">{commodity.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">per {commodity.unit}</p>
            </div>
            <TrafficLightSignal
              signal={signal}
              size="lg"
              showLabel={true}
              showRecommendation={false}
            />
          </div>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto pb-8">
          {/* Current Price */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Harga Saat Ini</p>
                  <p className="text-3xl font-bold">{formatRupiah(latestPrice)}</p>
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-lg font-semibold',
                  isPositive ? 'text-[oklch(0.55_0.18_145)]' : 'text-[oklch(0.55_0.2_25)]'
                )}>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  {formatPercent(priceChangePercent)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signal Recommendation */}
          <Card className={cn(
            'border-2',
            signal.signal === 'green' && 'border-[oklch(0.6_0.18_145)] bg-[oklch(0.6_0.18_145/0.1)]',
            signal.signal === 'yellow' && 'border-[oklch(0.75_0.15_85)] bg-[oklch(0.75_0.15_85/0.1)]',
            signal.signal === 'red' && 'border-[oklch(0.55_0.22_25)] bg-[oklch(0.55_0.22_25/0.1)]'
          )}>
            <CardContent className="p-4">
              <p className="font-semibold mb-1">Rekomendasi</p>
              <p className="text-sm">{signal.recommendation}</p>
            </CardContent>
          </Card>

          {/* Candlestick Chart */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Grafik Harga 30 Hari</h3>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="h-64">
                <CandlestickChart
                  data={ohlcData}
                  height={256}
                  showAxis={true}
                  showTooltip={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Tertinggi (7 hari)"
              value={formatRupiah(weekHigh)}
              icon={<TrendingUp className="w-4 h-4 text-[oklch(0.55_0.18_145)]" />}
            />
            <StatCard
              label="Terendah (7 hari)"
              value={formatRupiah(weekLow)}
              icon={<TrendingDown className="w-4 h-4 text-[oklch(0.55_0.2_25)]" />}
            />
            <StatCard
              label="Volume Harian"
              value={`${avgVolume.toLocaleString('id-ID')} kg`}
              icon={<BarChart3 className="w-4 h-4 text-muted-foreground" />}
            />
            <StatCard
              label="Data Terakhir"
              value={formatDate(ohlcData[ohlcData.length - 1]?.date || '')}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
          </div>

          {/* Price History Table */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Riwayat Harga (7 Hari Terakhir)</h3>
              <div className="space-y-2">
                {weekData.slice().reverse().map((d, i) => (
                  <div
                    key={d.date}
                    className={cn(
                      'flex items-center justify-between py-2 text-sm',
                      i !== weekData.length - 1 && 'border-b border-border'
                    )}
                  >
                    <span className="text-muted-foreground">{formatDate(d.date)}</span>
                    <div className="flex items-center gap-4">
                      <span>{formatRupiah(d.close)}</span>
                      {d.close >= d.open ? (
                        <span className="text-[oklch(0.55_0.18_145)] text-xs">
                          +{(((d.close - d.open) / d.open) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[oklch(0.55_0.2_25)] text-xs">
                          {(((d.close - d.open) / d.open) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

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
import { TrendingUp, TrendingDown, BarChart3, Calendar, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePredictions } from '@/lib/hooks/use-predictions'

interface CommodityDetailSheetProps {
  data: CommodityPriceData | undefined
  marketId: string | null
  isOpen: boolean
  onClose: () => void
}

export function CommodityDetailSheet({
  data,
  marketId,
  isOpen,
  onClose,
}: CommodityDetailSheetProps) {
  if (!data) return null

  const { commodity, latestPrice, priceChangePercent, signal, ohlcData } = data
  const isPositive = priceChangePercent >= 0

  // Fetch predictions
  const { data: predictionData, isLoading: loadingPredictions } = usePredictions(data.commodity.id, marketId)

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

          {/* AI Predictions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Prediksi Harga (7 Hari)
                </h3>
                {loadingPredictions && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {predictionData ? (
                <div className="space-y-3">
                  {/* Current Signal from AI */}
                  <div className={cn(
                    'p-3 rounded-lg border-2',
                    predictionData.signal.color === 'GREEN' && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                    predictionData.signal.color === 'YELLOW' && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
                    predictionData.signal.color === 'RED' && 'border-red-500 bg-red-50 dark:bg-red-950/20'
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{predictionData.signal.label_text}</span>
                      <span className="text-sm text-muted-foreground">
                        {predictionData.signal.confidence_pct}% confidence
                      </span>
                    </div>
                    <p className="text-sm">{predictionData.signal.action_text}</p>
                  </div>

                  {/* Price Mode */}
                  <div className="text-center p-2 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Harga Modus</p>
                    <p className="font-semibold text-lg">{formatRupiah(predictionData.price_mode)}</p>
                  </div>

                  {/* Predictions List */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {predictionData.predictions.map((pred, index) => (
                      <div key={pred.date} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded text-sm">
                        <span className="text-muted-foreground">{formatDate(pred.date)}</span>
                        <div className="text-right">
                          <div className="font-medium">{formatRupiah(pred.predicted_price)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatRupiah(pred.price_low)} - {formatRupiah(pred.price_high)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {predictionData.cached && (
                    <p className="text-xs text-muted-foreground text-center">
                      Data dari cache
                    </p>
                  )}
                </div>
              ) : loadingPredictions ? (
                <div className="space-y-3">
                  <div className="h-16 bg-muted animate-pulse rounded" />
                  <div className="h-8 bg-muted animate-pulse rounded" />
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Gagal memuat prediksi
                </p>
              )}
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

// Stat Card Component
interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="font-semibold text-sm">{value}</p>
      </CardContent>
    </Card>
  )
}

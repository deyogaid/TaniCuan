'use client'

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { PricePrediction } from '@/lib/types'
import { formatRupiah, formatDate } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LSTMPredictionChartProps {
  predictions: PricePrediction[]
  currentPrice?: number
  commodityName?: string
}

export function LSTMPredictionChart({
  predictions,
  currentPrice,
  commodityName = 'Commodity'
}: LSTMPredictionChartProps) {
  if (!predictions || predictions.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          <p>Tidak ada data prediksi LSTM</p>
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart
  const chartData = predictions.map((p) => ({
    date: formatDate(p.date),
    predicted_price: Math.round(p.predicted_price),
    price_low: Math.round(p.price_low),
    price_high: Math.round(p.price_high),
    confidence: Math.round(p.confidence_level * 100),
    rawDate: p.date,
  }))

  // Calculate average predictions and confidence
  const avgPredicted = Math.round(
    predictions.reduce((sum, p) => sum + p.predicted_price, 0) / predictions.length
  )
  const avgConfidence = Math.round(
    predictions.reduce((sum, p) => sum + p.confidence_level, 0) / predictions.length * 100
  )

  const priceChange = currentPrice ? avgPredicted - currentPrice : 0
  const priceChangePercent = currentPrice ? (priceChange / currentPrice) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Prediksi Harga LSTM (7 Hari)</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Model pembelajaran mendalam untuk prediksi jangka menengah
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Harga Prediksi Rata-rata</p>
            <p className="font-semibold text-sm">{formatRupiah(avgPredicted)}</p>
            {currentPrice && (
              <p className={`text-xs mt-1 ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? '+' : ''}{formatRupiah(priceChange)} ({priceChangePercent.toFixed(1)}%)
              </p>
            )}
          </div>
          <div className="bg-secondary p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Rata-rata Confidence</p>
            <p className="font-semibold text-sm">{avgConfidence}%</p>
          </div>
          <div className="bg-secondary p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Range Harga</p>
            <p className="font-semibold text-sm text-xs">
              {formatRupiah(
                Math.round(
                  predictions.reduce((min, p) => Math.min(min, p.price_low), Infinity)
                )
              )}
              {' - '}
              {formatRupiah(
                Math.round(
                  predictions.reduce((max, p) => Math.max(max, p.price_high), -Infinity)
                )
              )}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                opacity={0.5}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                opacity={0.5}
                tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}rb`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                }}
                formatter={(value: number) => formatRupiah(value)}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Legend />
              
              {/* Confidence Range (Shaded Area) */}
              <Area
                type="monotone"
                dataKey="price_high"
                fill="rgba(34, 197, 94, 0.1)"
                stroke="none"
                name="Range Atas"
              />
              <Area
                type="monotone"
                dataKey="price_low"
                fill="rgba(239, 68, 68, 0.1)"
                stroke="none"
                name="Range Bawah"
              />

              {/* Predicted Price Line */}
              <Line
                type="monotone"
                dataKey="predicted_price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Harga Prediksi"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Detail Info */}
        <div className="text-xs text-muted-foreground space-y-2 border-t pt-3">
          <p>
            📊 Prediksi berdasarkan model LSTM dengan analisis data historis 30 hari terakhir
          </p>
          <p>
            📈 Range harga menunjukkan interval kepercayaan yang menurun seiring bertambahnya hari prediksi
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

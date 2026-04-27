'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { OHLCData } from '@/lib/types'
import { formatDate } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, TrendingUp } from 'lucide-react'

interface EGARCHVolatilityChartProps {
  ohlcData: OHLCData[]
  commodityName?: string
}

// Calculate EGARCH (Exponential GARCH) volatility
function calculateEGARCHVolatility(prices: number[], window: number = 7) {
  const volatilityData = []
  
  for (let i = window; i < prices.length; i++) {
    const windowPrices = prices.slice(i - window, i + 1)
    
    // Calculate returns
    const returns = []
    for (let j = 1; j < windowPrices.length; j++) {
      const ret = (windowPrices[j] - windowPrices[j - 1]) / windowPrices[j - 1]
      returns.push(ret)
    }
    
    // Calculate volatility (standard deviation of returns)
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance) * 100 // Convert to percentage
    
    // Calculate skewness (asymmetry) for exponential component
    const skewness = returns.length > 0
      ? returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 3), 0) / returns.length / Math.pow(Math.sqrt(variance), 3)
      : 0
    
    volatilityData.push({
      volatility: Math.max(0, volatility),
      skewness: skewness,
    })
  }
  
  // Pad beginning with first value
  const firstVol = volatilityData[0] || { volatility: 0, skewness: 0 }
  return Array(window).fill(firstVol).concat(volatilityData)
}

export function EGARCHVolatilityChart({
  ohlcData,
  commodityName = 'Commodity'
}: EGARCHVolatilityChartProps) {
  if (!ohlcData || ohlcData.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          <p>Tidak ada data volatilitas</p>
        </CardContent>
      </Card>
    )
  }

  const prices = ohlcData.map(d => d.close)
  const volatilityData = calculateEGARCHVolatility(prices)

  // Merge with dates
  const chartData = ohlcData.map((ohlc, idx) => ({
    date: formatDate(ohlc.date),
    rawDate: ohlc.date,
    volatility: volatilityData[idx]?.volatility || 0,
    skewness: volatilityData[idx]?.skewness || 0,
    price: ohlc.close,
  }))

  // Calculate statistics
  const volatilities = chartData.map(d => d.volatility)
  const avgVolatility = volatilities.reduce((a, b) => a + b, 0) / volatilities.length
  const maxVolatility = Math.max(...volatilities)
  const minVolatility = Math.min(...volatilities)
  const currentVolatility = chartData[chartData.length - 1]?.volatility || 0
  
  // Volatility trend
  const recentAvg = volatilities.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, volatilities.length)
  const isVolatilityIncreasing = currentVolatility > recentAvg
  
  // Risk indicator
  const getRiskLevel = (vol: number) => {
    if (vol < 0.5) return { label: 'Rendah', color: 'text-green-600', bg: 'bg-green-50' }
    if (vol < 1) return { label: 'Sedang', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { label: 'Tinggi', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const riskLevel = getRiskLevel(currentVolatility)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Volatilitas Harga (EGARCH)</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Model EGARCH untuk mengukur ketidakstabilan harga (risiko pasar)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Indicator */}
        <div className={`${riskLevel.bg} p-3 rounded-lg border-l-4 ${riskLevel.color === 'text-green-600' ? 'border-green-600' : riskLevel.color === 'text-yellow-600' ? 'border-yellow-600' : 'border-red-600'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className={`w-4 h-4 ${riskLevel.color}`} />
            <span className={`font-semibold text-sm ${riskLevel.color}`}>
              Tingkat Risiko: {riskLevel.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Volatilitas saat ini {isVolatilityIncreasing ? '📈 meningkat' : '📉 menurun'} dibanding rata-rata 7 hari
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Volatilitas Saat Ini</p>
            <p className="font-semibold text-sm">{currentVolatility.toFixed(2)}%</p>
          </div>
          <div className="bg-secondary p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Rata-rata (30 hari)</p>
            <p className="font-semibold text-sm">{avgVolatility.toFixed(2)}%</p>
          </div>
          <div className="bg-secondary p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Volatilitas Max</p>
            <p className="font-semibold text-sm">{maxVolatility.toFixed(2)}%</p>
          </div>
          <div className="bg-secondary p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Volatilitas Min</p>
            <p className="font-semibold text-sm">{minVolatility.toFixed(2)}%</p>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                label={{ value: 'Volatilitas (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'volatility') return [`${value.toFixed(3)}%`, 'Volatilitas']
                  if (name === 'skewness') return [value.toFixed(3), 'Skewness']
                  return [value, name]
                }}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Legend />
              
              {/* Average Reference Line */}
              <ReferenceLine
                y={avgVolatility}
                stroke="#8b5cf6"
                strokeDasharray="5 5"
                label={{ value: `Rata-rata: ${avgVolatility.toFixed(2)}%`, position: 'right', fill: '#8b5cf6', fontSize: 11 }}
              />
              
              {/* Volatility Area */}
              <Area
                type="monotone"
                dataKey="volatility"
                fill="url(#colorVol)"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Volatilitas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Interpretation Guide */}
        <div className="text-xs text-muted-foreground space-y-2 border-t pt-3 bg-secondary/50 p-3 rounded">
          <p className="font-semibold text-foreground mb-2">📚 Interpretasi EGARCH:</p>
          <ul className="space-y-1 ml-2">
            <li>• <strong>Volatilitas Rendah (&lt;0.5%)</strong>: Harga stabil, risiko pasar minimal</li>
            <li>• <strong>Volatilitas Sedang (0.5-1%)</strong>: Fluktuasi normal, perlu monitoring</li>
            <li>• <strong>Volatilitas Tinggi (&gt;1%)</strong>: Harga tidak stabil, risiko tinggi</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

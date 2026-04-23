'use client'

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import type { OHLCData } from '@/lib/types'
import { formatRupiah, formatDate } from '@/lib/types'

interface CandlestickChartProps {
  data: OHLCData[]
  height?: number
  showAxis?: boolean
  showTooltip?: boolean
}

interface CandlestickDataPoint {
  date: string
  displayDate: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  // For bar chart rendering
  bodyBottom: number
  bodyHeight: number
  wickTop: number
  wickBottom: number
  isBullish: boolean
}

function transformData(data: OHLCData[]): CandlestickDataPoint[] {
  return data.map((d) => {
    const isBullish = d.close >= d.open
    const bodyBottom = Math.min(d.open, d.close)
    const bodyTop = Math.max(d.open, d.close)
    
    return {
      ...d,
      displayDate: formatDate(d.date),
      bodyBottom,
      bodyHeight: bodyTop - bodyBottom || 100, // Minimum height for flat candles
      wickTop: d.high - bodyTop,
      wickBottom: bodyBottom - d.low,
      isBullish,
    }
  })
}

// Custom tooltip component
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: CandlestickDataPoint }[] }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const changePercent = ((data.close - data.open) / data.open) * 100

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-sm mb-2">{data.displayDate}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Buka:</span>
          <span>{formatRupiah(data.open)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Tertinggi:</span>
          <span>{formatRupiah(data.high)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Terendah:</span>
          <span>{formatRupiah(data.low)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Tutup:</span>
          <span className="font-semibold">{formatRupiah(data.close)}</span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-border">
          <span className="text-muted-foreground">Perubahan:</span>
          <span className={data.isBullish ? 'text-[oklch(0.55_0.18_145)]' : 'text-[oklch(0.55_0.2_25)]'}>
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// Custom candle shape
function CandleShape(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: CandlestickDataPoint
}) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props
  if (!payload) return null

  const isBullish = payload.isBullish
  const fill = isBullish ? 'oklch(0.55 0.18 145)' : 'oklch(0.55 0.2 25)'
  const stroke = isBullish ? 'oklch(0.45 0.15 145)' : 'oklch(0.45 0.18 25)'

  // Calculate wick positions
  const centerX = x + width / 2
  const wickWidth = 2
  
  // Wick calculations based on actual price data
  const scale = height / (payload.bodyHeight || 1)
  const topWickHeight = payload.wickTop * scale
  const bottomWickHeight = payload.wickBottom * scale

  return (
    <g>
      {/* Top wick */}
      <rect
        x={centerX - wickWidth / 2}
        y={y - topWickHeight}
        width={wickWidth}
        height={topWickHeight}
        fill={stroke}
      />
      {/* Body */}
      <rect
        x={x + 2}
        y={y}
        width={Math.max(width - 4, 4)}
        height={Math.max(height, 2)}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
        rx={2}
      />
      {/* Bottom wick */}
      <rect
        x={centerX - wickWidth / 2}
        y={y + height}
        width={wickWidth}
        height={bottomWickHeight}
        fill={stroke}
      />
    </g>
  )
}

export function CandlestickChart({
  data,
  height = 200,
  showAxis = false,
  showTooltip = true,
}: CandlestickChartProps) {
  const chartData = transformData(data)
  
  // Calculate domain for Y axis
  const allPrices = data.flatMap(d => [d.low, d.high])
  const minPrice = Math.min(...allPrices) * 0.95
  const maxPrice = Math.max(...allPrices) * 1.05

  // Get average price for reference line
  const avgPrice = data.reduce((sum, d) => sum + d.close, 0) / data.length

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
      >
        {showAxis && (
          <>
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}rb`}
              width={45}
            />
          </>
        )}
        
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        
        {/* Average price reference line */}
        <ReferenceLine
          y={avgPrice}
          stroke="oklch(0.6 0.02 145)"
          strokeDasharray="3 3"
          strokeWidth={1}
        />

        {/* Candlestick bars */}
        <Bar
          dataKey="bodyHeight"
          shape={<CandleShape />}
          isAnimationActive={false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isBullish ? 'oklch(0.55 0.18 145)' : 'oklch(0.55 0.2 25)'}
            />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// Mini version for commodity cards
export function MiniCandlestickChart({ data }: { data: OHLCData[] }) {
  return <CandlestickChart data={data.slice(-14)} height={80} showAxis={false} showTooltip={false} />
}

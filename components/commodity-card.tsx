'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CommodityPriceData } from '@/lib/types'
import { formatRupiah, formatPercent } from '@/lib/types'
import { SignalBadge } from './traffic-light-signal'
import { MiniCandlestickChart } from './candlestick-chart'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface CommodityCardProps {
  data: CommodityPriceData
  onClick?: () => void
  isSelected?: boolean
}

// Commodity icon mapping
const commodityIcons: Record<string, string> = {
  pepper: '/icons/chili.svg',
  onion: '/icons/onion.svg',
  garlic: '/icons/garlic.svg',
  tomato: '/icons/tomato.svg',
  potato: '/icons/potato.svg',
  carrot: '/icons/carrot.svg',
  cabbage: '/icons/cabbage.svg',
  banana: '/icons/banana.svg',
  orange: '/icons/orange.svg',
}

// Fallback emoji icons
const commodityEmoji: Record<string, string> = {
  'Cabai Merah': 'chili',
  'Cabai Rawit': 'chili',
  'Bawang Merah': 'onion',
  'Bawang Putih': 'garlic',
  'Tomat': 'tomato',
  'Kentang': 'potato',
  'Wortel': 'carrot',
  'Kubis': 'cabbage',
  'Pisang': 'banana',
  'Jeruk': 'orange',
}

function getCommodityColor(name: string): string {
  const colors: Record<string, string> = {
    'Cabai Merah': 'bg-red-100 text-red-700',
    'Cabai Rawit': 'bg-orange-100 text-orange-700',
    'Bawang Merah': 'bg-purple-100 text-purple-700',
    'Bawang Putih': 'bg-slate-100 text-slate-700',
    'Tomat': 'bg-red-100 text-red-600',
    'Kentang': 'bg-amber-100 text-amber-700',
    'Wortel': 'bg-orange-100 text-orange-600',
    'Kubis': 'bg-green-100 text-green-700',
    'Pisang': 'bg-yellow-100 text-yellow-700',
    'Jeruk': 'bg-orange-100 text-orange-600',
  }
  return colors[name] || 'bg-gray-100 text-gray-700'
}

function CommodityIcon({ name }: { name: string }) {
  const colorClass = getCommodityColor(name)
  const initial = name.charAt(0)
  
  return (
    <div className={cn(
      'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg',
      colorClass
    )}>
      {initial}
    </div>
  )
}

function PriceChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return <TrendingUp className="w-4 h-4 text-[oklch(0.55_0.18_145)]" />
  }
  if (change < 0) {
    return <TrendingDown className="w-4 h-4 text-[oklch(0.55_0.2_25)]" />
  }
  return <Minus className="w-4 h-4 text-muted-foreground" />
}

export function CommodityCard({ data, onClick, isSelected }: CommodityCardProps) {
  const { commodity, latestPrice, priceChangePercent, signal, ohlcData } = data
  const isPositive = priceChangePercent >= 0

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] overflow-hidden flex flex-col',
        isSelected && 'ring-2 ring-primary shadow-md'
      )}
      onClick={onClick}
    >
      {/* Product Image Placeholder */}
      <div className={cn(
        'w-full aspect-square flex flex-col items-center justify-center bg-secondary/50',
        getCommodityColor(commodity.name).replace('text-', 'text-opacity-0 bg-')
      )}>
         <div className={cn('text-6xl font-bold opacity-30', getCommodityColor(commodity.name).split(' ')[1])}>
            {commodity.name.charAt(0)}
         </div>
      </div>

      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Title & Signal */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-sm line-clamp-2 leading-tight flex-1">{commodity.name}</h3>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="text-base font-bold mb-1">{formatRupiah(latestPrice)}</div>
          
          <div className="flex flex-wrap items-center justify-between gap-2">
             <div className="flex items-center gap-1">
               <span className={cn(
                 'text-[10px] px-1.5 py-0.5 rounded font-bold',
                 isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
               )}>
                 {isPositive ? '+' : ''}{formatPercent(priceChangePercent)}
               </span>
               <span className="text-[10px] text-muted-foreground">/ {commodity.unit}</span>
             </div>
             <SignalBadge signal={signal} />
          </div>
        </div>

        {/* Mini Chart (Optional, keep it very small at the bottom or hide) */}
        <div className="h-8 -mx-1 mt-3 opacity-60">
          <MiniCandlestickChart data={ohlcData} />
        </div>
      </CardContent>
    </Card>
  )
}

// List variant for compact view
export function CommodityListItem({ data, onClick, isSelected }: CommodityCardProps) {
  const { commodity, latestPrice, priceChangePercent, signal } = data
  const isPositive = priceChangePercent >= 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-card border cursor-pointer transition-all',
        'hover:shadow-sm active:scale-[0.99]',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      <CommodityIcon name={commodity.name} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm truncate">{commodity.name}</h3>
          <SignalBadge signal={signal} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-bold">{formatRupiah(latestPrice)}</span>
          <span className={cn(
            'text-xs font-medium',
            isPositive ? 'text-[oklch(0.55_0.18_145)]' : 'text-[oklch(0.55_0.2_25)]'
          )}>
            {formatPercent(priceChangePercent)}
          </span>
        </div>
      </div>
    </div>
  )
}

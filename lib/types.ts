// Database types for TaniCuan platform

export interface Commodity {
  id: string
  name: string
  category: 'sayur' | 'buah' | 'umbi' | 'bumbu'
  unit: string
  icon: string | null
  created_at: string
}

export interface Market {
  id: string
  name: string
  location: string | null
  province: string | null
  is_primary: boolean
  created_at: string
}

export interface PriceHistory {
  id: string
  commodity_id: string
  market_id: string
  date: string
  open_price: number
  high_price: number
  low_price: number
  close_price: number
  volume: number
  created_at: string
}

// Extended types with relations
export interface PriceWithCommodity extends PriceHistory {
  commodity: Commodity
  market: Market
}

// OHLC data for candlestick chart
export interface OHLCData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Traffic light signal type
export type SignalType = 'red' | 'yellow' | 'green'

export interface TrafficSignal {
  signal: SignalType
  label: string
  recommendation: string
  priceChange: number
  volatility: number
}

// Commodity card data
export interface CommodityPriceData {
  commodity: Commodity
  latestPrice: number
  previousPrice: number
  priceChange: number
  priceChangePercent: number
  signal: TrafficSignal
  ohlcData: OHLCData[]
}

// Format helpers
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatShortRupiah(value: number): string {
  if (value >= 1000000) {
    return `Rp${(value / 1000000).toFixed(1)}jt`
  }
  if (value >= 1000) {
    return `Rp${(value / 1000).toFixed(0)}rb`
  }
  return `Rp${value}`
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

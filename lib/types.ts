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
  city: string | null
  province: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
  is_primary: boolean
  created_at: string
  // Computed field for distance (in km)
  distance?: number
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

// Price prediction data
export interface PricePrediction {
  date: string
  predicted_price: number
  price_low: number
  price_high: number
  confidence_level: number
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
  predictions?: PricePrediction[]
  priceMode?: number
}

// Transaction data
export interface Transaction {
  id: string
  user_id: string | null
  commodity_id: string
  market_id: string
  transaction_type: 'buy' | 'sell'
  quantity: number
  price_per_unit: number
  total_amount: number
  transaction_date: string
  notes: string | null
  created_at: string
  commodity?: {
    name: string
    category: string
  }
  market?: {
    name: string
  }
}

// Payload for syncing transaction to gateway
export interface TransactionPayload {
  commodity_id: string
  quantity: number
  price: number
}
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

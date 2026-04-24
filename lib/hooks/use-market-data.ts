'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Commodity, Market, PriceHistory, CommodityPriceData, OHLCData } from '@/lib/types'
import { calculateTrafficSignal } from '@/lib/signal-utils'

const supabase = createClient()

// Fetcher functions
async function fetchCommodities(): Promise<Commodity[]> {
  const { data, error } = await supabase
    .from('commodities')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

async function fetchMarkets(): Promise<Market[]> {
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .order('is_primary', { ascending: false })
    .order('name')
  
  if (error) throw error
  return data || []
}

async function fetchPriceHistory(
  marketId: string,
  days: number = 30
): Promise<PriceHistory[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('market_id', marketId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true })
  
  if (error) throw error
  return data || []
}

// Transform price history to OHLC format
function toOHLCData(prices: PriceHistory[]): OHLCData[] {
  return prices.map(p => ({
    date: p.date,
    open: Number(p.open_price),
    high: Number(p.high_price),
    low: Number(p.low_price),
    close: Number(p.close_price),
    volume: p.volume,
  }))
}

// Process commodity data with signals
function processCommodityData(
  commodities: Commodity[],
  priceHistory: PriceHistory[]
): CommodityPriceData[] {
  return commodities.map(commodity => {
    // Get prices for this commodity
    const prices = priceHistory
      .filter(p => p.commodity_id === commodity.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    const ohlcData = toOHLCData(prices)
    
    // Get latest and previous prices
    const latestPrice = prices.length > 0 ? Number(prices[prices.length - 1].close_price) : 0
    const previousPrice = prices.length > 1 ? Number(prices[prices.length - 2].close_price) : latestPrice
    
    // Calculate change
    const priceChange = latestPrice - previousPrice
    const priceChangePercent = previousPrice > 0 
      ? ((latestPrice - previousPrice) / previousPrice) * 100 
      : 0
    
    // Calculate signal
    const signal = calculateTrafficSignal(ohlcData)
    
    return {
      commodity,
      latestPrice,
      previousPrice,
      priceChange,
      priceChangePercent,
      signal,
      ohlcData,
    }
  }).filter(d => d.latestPrice > 0) // Only return commodities with price data
}

// SWR Hooks
export function useCommodities() {
  return useSWR('commodities', fetchCommodities, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  })
}

export function useMarkets() {
  return useSWR('markets', fetchMarkets, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })
}

export function usePriceHistory(marketId: string | null, days: number = 30) {
  return useSWR(
    marketId ? ['price_history', marketId, days] : null,
    () => fetchPriceHistory(marketId!, days),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )
}

// Combined hook for dashboard data
export function useDashboardData(marketId: string | null) {
  const { data: commodities, error: commoditiesError, isLoading: loadingCommodities } = useCommodities()
  const { data: priceHistory, error: priceError, isLoading: loadingPrices, mutate } = usePriceHistory(marketId)
  
  const isLoading = loadingCommodities || loadingPrices
  const error = commoditiesError || priceError
  
  // Process data
  const commodityData = commodities && priceHistory
    ? processCommodityData(commodities, priceHistory)
    : []
  
  // Sort by signal priority: green > yellow > red, then by price change
  const sortedData = [...commodityData].sort((a, b) => {
    const signalOrder = { green: 0, yellow: 1, red: 2 }
    const signalDiff = signalOrder[a.signal.signal] - signalOrder[b.signal.signal]
    if (signalDiff !== 0) return signalDiff
    return Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent)
  })
  
  return {
    commodityData: sortedData,
    isLoading,
    error,
    refresh: mutate,
  }
}

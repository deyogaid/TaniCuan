import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateTrafficSignal } from '@/lib/signal-utils'
import type { PricePrediction, OHLCData } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Simple prediction algorithm based on moving averages and volatility
function generatePredictions(ohlcData: OHLCData[], days: number = 7): PricePrediction[] {
  if (ohlcData.length < 7) return []

  const predictions: PricePrediction[] = []
  const lastPrice = ohlcData[ohlcData.length - 1].close

  // Calculate moving averages
  const ma7 = ohlcData.slice(-7).reduce((sum, d) => sum + d.close, 0) / 7
  const ma14 = ohlcData.length >= 14
    ? ohlcData.slice(-14).reduce((sum, d) => sum + d.close, 0) / 14
    : ma7

  // Calculate volatility (standard deviation of last 7 days)
  const prices = ohlcData.slice(-7).map(d => d.close)
  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
  const volatility = Math.sqrt(variance)

  // Trend direction
  const trend = ma7 > ma14 ? 1 : ma7 < ma14 ? -1 : 0

  // Generate predictions for next days
  for (let i = 1; i <= days; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)

    // Base prediction with trend and random walk
    const baseChange = trend * (volatility * 0.1) + (Math.random() - 0.5) * volatility * 0.2
    const predictedPrice = lastPrice + baseChange

    // Confidence decreases with time
    const confidence = Math.max(0.3, 0.9 - (i * 0.1))

    // Price range based on volatility
    const range = volatility * confidence
    const priceLow = predictedPrice - range
    const priceHigh = predictedPrice + range

    predictions.push({
      date: date.toISOString().split('T')[0],
      predicted_price: Math.max(0, predictedPrice),
      price_low: Math.max(0, priceLow),
      price_high: Math.max(0, priceHigh),
      confidence_level: confidence
    })
  }

  return predictions
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commodityId: string }> }
) {
  try {
    const { commodityId } = await params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const marketId = searchParams.get('marketId')

    if (!marketId) {
      return NextResponse.json({ error: 'marketId is required' }, { status: 400 })
    }

    // Fetch recent price history for the commodity and market
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // Last 30 days for analysis

    const { data: priceHistory, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('commodity_id', commodityId)
      .eq('market_id', marketId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error

    if (!priceHistory || priceHistory.length === 0) {
      return NextResponse.json({
        signal: { color: 'YELLOW', label_text: 'Data tidak cukup', action_text: 'Tunggu data lebih banyak', confidence_pct: 0 },
        price_mode: 0,
        predictions: [],
        cached: false
      })
    }

    // Convert to OHLC format
    const ohlcData: OHLCData[] = priceHistory.map(p => ({
      date: p.date,
      open: Number(p.open_price),
      high: Number(p.high_price),
      low: Number(p.low_price),
      close: Number(p.close_price),
      volume: p.volume,
    }))

    // Generate predictions
    const predictions = generatePredictions(ohlcData, days)

    // Calculate signal
    const signal = calculateTrafficSignal(ohlcData)

    // Calculate price mode (most frequent price range)
    const latestPrices = ohlcData.slice(-7).map(d => d.close)
    const priceMode = latestPrices.reduce((sum, p) => sum + p, 0) / latestPrices.length

    return new Response(JSON.stringify({
      signal: {
        color: signal.signal.toUpperCase(),
        label_text: signal.label,
        action_text: signal.recommendation,
        confidence_pct: Math.round(signal.priceChange * 10), // Simplified confidence
        model_raw: {
          ma7: ohlcData.slice(-7).reduce((sum, d) => sum + d.close, 0) / 7,
          sigma: Math.sqrt(latestPrices.reduce((sum, p) => sum + Math.pow(p - priceMode, 2), 0) / latestPrices.length),
          volatility_ratio: signal.volatility,
          momentum: signal.priceChange
        }
      },
      price_mode: priceMode,
      predictions,
      cached: false
    }), {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error) {
    console.error('Prediction API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    )
  }
}
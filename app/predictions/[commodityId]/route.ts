/**
 * app/api/predictions/[commodityId]/route.ts
 *
 * App Router Route Handler — TypeScript
 * GET /api/predictions/{commodityId}?days=7
 * POST /api/predictions/generate (dari Cron)
 *
 * Stack: Next.js 16 + Supabase + recharts-compatible output
 * Integrated with AI Studio for enhanced predictions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────
interface PricePrediction {
  date: string
  predicted_price: number
  price_low: number
  price_high: number
  confidence_level: number
}

interface TrafficSignal {
  color: 'GREEN' | 'YELLOW' | 'RED'
  label_text: string
  action_text: string
  confidence_pct: number
  model_raw: {
    ma7: number
    sigma: number
    volatility_ratio: number
    momentum: number
  }
}

// ─── Hitung Harga Modus (keputusan Product Manager) ──────────────────────────
function computePriceMode(prices: number[]): number {
  const rounded = prices.map((p) => Math.round(p / 500) * 500)
  const freq: Record<number, number> = {}
  let maxFreq = 0
  let mode = rounded[0]

  for (const p of rounded) {
    freq[p] = (freq[p] ?? 0) + 1
    if (freq[p] > maxFreq) { maxFreq = freq[p]; mode = p }
  }
  return mode
}

// ─── Call AI Studio for Enhanced Predictions ────────────────────────────────
async function getAIPredictions(prices: number[], days: number): Promise<PricePrediction[] | null> {
  try {
    const aiStudioUrl = process.env.NODE_ENV === 'production'
      ? process.env.AI_STUDIO_SHARED_URL
      : process.env.AI_STUDIO_DEV_URL

    if (!aiStudioUrl) {
      console.warn('AI Studio URL not configured, falling back to local predictions')
      return null
    }

    const response = await fetch(`${aiStudioUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        historical_prices: prices,
        prediction_days: days,
      }),
    })

    if (!response.ok) {
      console.warn(`AI Studio API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    // Assume AI Studio returns array of predictions with date, predicted_price, confidence_level
    return data.predictions.map((p: any) => ({
      date: p.date,
      predicted_price: Math.round(p.predicted_price),
      price_low: Math.round(p.price_low || p.predicted_price * 0.95),
      price_high: Math.round(p.price_high || p.predicted_price * 1.05),
      confidence_level: p.confidence_level || 80,
    }))
  } catch (error) {
    console.error('Error calling AI Studio:', error)
    return null
  }
}

// ─── Traffic Light Signal ─────────────────────────────────────────────────────
function computeSignal(prices: number[], predictedPrice: number): TrafficSignal {
  if (prices.length < 7) {
    return {
      color: 'YELLOW',
      label_text: 'Pantau Terus',
      action_text: 'Data belum cukup. Pantau harga hari ini.',
      confidence_pct: 50,
      model_raw: { ma7: 0, sigma: 0, volatility_ratio: 0, momentum: 0 },
    }
  }

  const recent = prices.slice(-7)
  const ma7 = recent.reduce((a, b) => a + b, 0) / recent.length
  const variance = recent.reduce((s, p) => s + Math.pow(p - ma7, 2), 0) / recent.length
  const sigma = Math.sqrt(variance)
  const volatilityRatio = sigma / ma7
  const momentum =
    (prices[prices.length - 1] - prices[prices.length - 4]) / prices[prices.length - 4]

  let color: 'GREEN' | 'YELLOW' | 'RED'
  let label_text: string
  let action_text: string
  let confidence_pct: number

  if (predictedPrice > ma7 * 1.03 && volatilityRatio < 0.05 && momentum > 0) {
    color = 'GREEN'
    label_text = 'Jual Sekarang'
    action_text = 'Harga sedang bagus dan cenderung naik. Waktu tepat untuk menjual.'
    confidence_pct = Math.min(95, Math.round(70 + momentum * 200))
  } else if (predictedPrice < ma7 * 0.97 || volatilityRatio > 0.08) {
    color = 'RED'
    label_text = 'Tahan Panen'
    action_text = 'Harga tidak menguntungkan. Tahan penjualan jika memungkinkan.'
    confidence_pct = Math.min(90, Math.round(60 + volatilityRatio * 200))
  } else {
    color = 'YELLOW'
    label_text = 'Pantau Terus'
    action_text = 'Harga stabil namun belum optimal. Pantau hingga jam 7 pagi.'
    confidence_pct = 65
  }

  return {
    color, label_text, action_text, confidence_pct,
    model_raw: {
      ma7: Math.round(ma7),
      sigma: Math.round(sigma),
      volatility_ratio: parseFloat(volatilityRatio.toFixed(4)),
      momentum: parseFloat(momentum.toFixed(4)),
    },
  }
}

// ─── Linear Regression Forecast (fallback lokal, tanpa dependency) ────────────
function computeLocalForecast(prices: number[], days = 7): PricePrediction[] {
  const n = prices.length
  if (n < 14) return []

  const xMean = (n - 1) / 2
  const yMean = prices.reduce((a, b) => a + b, 0) / n

  let num = 0, den = 0
  prices.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += Math.pow(x - xMean, 2) })

  const slope = den !== 0 ? num / den : 0
  const intercept = yMean - slope * xMean

  const recent = prices.slice(-14)
  const stdDev = Math.sqrt(
    recent.reduce((s, p) => s + Math.pow(p - yMean, 2), 0) / recent.length
  )
  const last = prices[prices.length - 1]

  return Array.from({ length: days }, (_, i) => {
    const trend = intercept + slope * (n + i)
    const blended = trend * 0.5 + last * 0.5
    const unc = stdDev * (1 + i * 0.1)
    const date = new Date()
    date.setDate(date.getDate() + i + 1)

    return {
      date: date.toISOString().split('T')[0],
      predicted_price: Math.round(blended),
      price_low: Math.round(blended - unc),
      price_high: Math.round(blended + unc),
      confidence_level: Math.max(40, 85 - i * 5),
    }
  })
}

// ─── GET /api/predictions/[commodityId] ──────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commodityId: string }> }
) {
  const { commodityId } = await params
  const days = parseInt(request.nextUrl.searchParams.get('days') ?? '7')

  const supabase = createServiceClient()

  // Get primary market ID, cached prediction, and price history in parallel
  const [primaryMarketResult, cachedResult, historyResult] = await Promise.all([
    supabase
      .from('markets')
      .select('id')
      .eq('is_primary', true)
      .limit(1)
      .single(),

    supabase
      .from('price_predictions')
      .select('*')
      .eq('commodity_id', commodityId)
      .gte('prediction_date', new Date().toISOString().split('T')[0])
      .order('prediction_date')
      .limit(days),

    supabase
      .from('price_history')
      .select('close_price')
      .eq('commodity_id', commodityId)
      .eq('is_validated', true)
      .order('date', { ascending: false })
      .limit(30),
  ])

  const primaryMarket = primaryMarketResult.data
  const defaultMarketId = primaryMarket?.id || 'default-market-id'
  const cached = cachedResult.data
  const history = historyResult.data

  const prices = (history ?? []).map((h) => h.close_price as number).reverse()

  if (cached && cached.length >= days) {
    const signal = computeSignal(prices, cached[0].predicted_price as number)

    return NextResponse.json({
      commodity_id: commodityId,
      signal,
      price_mode: computePriceMode(prices),
      predictions: cached.map((p) => ({
        date: p.prediction_date,
        predicted_price: p.predicted_price,
        price_low: Math.round((p.predicted_price as number) * 0.92),
        price_high: Math.round((p.predicted_price as number) * 1.08),
        confidence_level: p.confidence_level,
      })),
      cached: true,
    })
  }

  // 3. Generate fresh predictions (try AI Studio first, fallback to local)
  const aiPredictions = await getAIPredictions(prices, days)
  let freshPredictions: PricePrediction[]
  let usedAI = false

  if (aiPredictions && aiPredictions.length > 0) {
    freshPredictions = aiPredictions
    usedAI = true
  } else {
    console.log('Using local forecast as fallback')
    freshPredictions = computeLocalForecast(prices, days)
  }

  if (freshPredictions.length === 0) {
    return NextResponse.json(
      { error: 'Insufficient historical data' },
      { status: 422 }
    )
  }

  // 4. Simpan ke DB (non-blocking)
  const modelVersion = usedAI ? 'ai-studio-v1' : 'linear-regression-v1'
  const insertData = freshPredictions.map((p) => ({
    commodity_id: commodityId,
    market_id: defaultMarketId,
    prediction_date: p.date,
    predicted_price: p.predicted_price,
    confidence_level: p.confidence_level,
    model_version: modelVersion,
  }))

  supabase.from('price_predictions').insert(insertData).then(() => { })

  const signal = computeSignal(prices, freshPredictions[0].predicted_price)

  // 5. Simpan sinyal ke commodity_signals
  supabase.from('commodity_signals').upsert({
    commodity_id: commodityId,
    signal_color: signal.color,
    signal_label: signal.label_text,
    action_text: signal.action_text,
    confidence_pct: signal.confidence_pct,
    price_mode: computePriceMode(prices),
    model_raw: signal.model_raw,
    computed_at: new Date().toISOString(),
    valid_until: new Date(Date.now() + 3_600_000).toISOString(),
  }, { onConflict: 'commodity_id' }).then(() => { })

  return NextResponse.json({
    commodity_id: commodityId,
    signal,
    price_mode: computePriceMode(prices),
    predictions: freshPredictions,
    cached: false,
  })
}

// ─── POST /api/predictions/generate (Cron) ───────────────────────────────────
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: commodities } = await supabase
    .from('commodities')
    .select('id, slug')
    .eq('is_active', true)

  if (!commodities) return NextResponse.json({ error: 'No commodities' }, { status: 404 })

  const results: Array<{ slug: string; status: string }> = []

  for (const commodity of commodities) {
    const { data: history } = await supabase
      .from('price_history')
      .select('close_price')
      .eq('commodity_id', commodity.id)
      .eq('is_validated', true)
      .order('date', { ascending: true })
      .limit(90)

    const prices = (history ?? []).map((h) => h.close_price as number)

    if (prices.length < 14) {
      results.push({ slug: commodity.slug, status: 'skipped' })
      continue
    }

    const predictions = computeLocalForecast(prices, 7)

    await supabase.from('price_predictions')
      .delete()
      .eq('commodity_id', commodity.id)
      .gte('prediction_date', new Date().toISOString().split('T')[0])

    await supabase.from('price_predictions').insert(
      predictions.map((p) => ({
        commodity_id: commodity.id,
        market_id: process.env.DEFAULT_MARKET_ID,
        prediction_date: p.date,
        predicted_price: p.predicted_price,
        confidence_level: p.confidence_level,
        model_version: 'linear-regression-v1',
      }))
    )

    results.push({ slug: commodity.slug, status: 'success' })
  }

  return NextResponse.json({ results, timestamp: new Date().toISOString() })
}

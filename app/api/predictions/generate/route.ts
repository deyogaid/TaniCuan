/**
 * app/api/predictions/generate/route.ts
 *
 * Cron endpoint untuk generate predictions untuk semua commodities aktif
 * Dipanggil setiap hari pukul 15:00 WIB (09:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

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

interface PricePrediction {
    date: string
    predicted_price: number
    price_low: number
    price_high: number
    confidence_level: number
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
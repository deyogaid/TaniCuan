/**
 * app/api/scraper/fetch-prices/route.ts
 * 
 * App Router Route Handler — TypeScript
 * Kompatibel: Next.js 16 + @supabase/ssr
 * 
 * Dipanggil via Vercel Cron (vercel.json)
 * Method: GET (Vercel Cron hanya support GET)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Peta nama komoditas PIHPS → slug internal
const COMMODITY_SLUG_MAP: Record<string, string> = {
  'Beras Medium':   'beras-medium',
  'Beras Premium':  'beras-premium',
  'Cabai Merah':    'cabai-merah',
  'Cabai Rawit':    'cabai-rawit',
  'Bawang Merah':   'bawang-merah',
  'Bawang Putih':   'bawang-putih',
  'Telur Ayam':     'telur-ayam',
  'Daging Ayam':    'daging-ayam',
  'Gula Pasir':     'gula-pasir',
  'Minyak Goreng':  'minyak-goreng',
}

interface PriceRow {
  commodity_name: string
  price: number
  source: string
}

// ─── Validasi Cron Authorization ─────────────────────────────────────────────
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

// ─── Fetcher: PIHPS BI ────────────────────────────────────────────────────────
async function fetchFromPIHPS(): Promise<PriceRow[] | null> {
  try {
    const res = await fetch('https://www.bi.go.id/hargapangan/TabelHarga/PasarTradisionalLuar', {
      headers: { 'User-Agent': 'AgriTransparansi-Bot/1.0' },
      signal: AbortSignal.timeout(15_000),
      // Next.js 16: no-store agar tidak di-cache oleh Next
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`PIHPS status: ${res.status}`)

    const html = await res.text()
    return parsePIHPS(html)
  } catch (err) {
    console.warn('[Pipeline] PIHPS failed:', (err as Error).message)
    return null
  }
}

function parsePIHPS(html: string): PriceRow[] {
  const rows: PriceRow[] = []
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi

  let rowMatch: RegExpExecArray | null
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const cells: string[] = []
    let cellMatch: RegExpExecArray | null
    const cellContent = rowMatch[1]

    while ((cellMatch = cellRegex.exec(cellContent)) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim())
    }

    if (cells.length >= 2 && COMMODITY_SLUG_MAP[cells[0]]) {
      const price = parseFloat(cells[1].replace(/[^\d]/g, ''))
      if (price > 0) rows.push({ commodity_name: cells[0], price, source: 'pihps' })
    }
  }
  return rows
}

// ─── IQR Outlier Detection ────────────────────────────────────────────────────
async function isOutlier(
  supabase: ReturnType<typeof createServiceClient>,
  commodityId: string,
  price: number
): Promise<boolean> {
  const { data } = await supabase
    .from('price_history')
    .select('close_price')
    .eq('commodity_id', commodityId)
    .order('date', { ascending: false })
    .limit(30)

  if (!data || data.length < 7) return false // Tidak cukup data untuk deteksi

  const sorted = data.map((d) => d.close_price as number).sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1

  return price < q1 - 1.5 * iqr || price > q3 + 1.5 * iqr
}

// ─── Cache Commodity ID ───────────────────────────────────────────────────────
const commodityCache = new Map<string, string>()

async function getCommodityId(
  supabase: ReturnType<typeof createServiceClient>,
  slug: string
): Promise<string | null> {
  if (commodityCache.has(slug)) return commodityCache.get(slug)!

  const { data } = await supabase
    .from('commodities')
    .select('id')
    .eq('slug', slug)
    .single()

  if (data?.id) commodityCache.set(slug, data.id)
  return data?.id ?? null
}

// ─── GET Handler (Cron Entry Point) ──────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const startTime = Date.now()
  const results = { success: [] as string[], failed: [] as string[], skipped: [] as string[] }

  // Fetch data — PIHPS utama, bisa tambah Sipedas sebagai fallback
  const priceRows = await fetchFromPIHPS()

  if (!priceRows || priceRows.length === 0) {
    return NextResponse.json({ error: 'All data sources unavailable' }, { status: 503 })
  }

  const today = new Date().toISOString().split('T')[0]

  for (const row of priceRows) {
    const slug = COMMODITY_SLUG_MAP[row.commodity_name]
    if (!slug) { results.skipped.push(row.commodity_name); continue }

    const commodityId = await getCommodityId(supabase, slug)
    if (!commodityId) { results.skipped.push(slug); continue }

    // Cek outlier
    const outlier = await isOutlier(supabase, commodityId, row.price)
    if (outlier) {
      await supabase.from('outlier_flags').insert({
        commodity_slug: slug,
        reported_price: row.price,
        source: row.source,
        flagged_at: new Date().toISOString(),
      })
      results.failed.push(slug)
      continue
    }

    // Ambil harga kemarin sebagai open
    const { data: prev } = await supabase
      .from('price_history')
      .select('close_price')
      .eq('commodity_id', commodityId)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    const openPrice = (prev?.close_price as number | null) ?? row.price

    // Upsert hari ini
    await supabase.from('price_history').upsert({
      commodity_id:  commodityId,
      market_id:     process.env.DEFAULT_MARKET_ID,
      date:          today,
      open_price:    openPrice,
      high_price:    Math.max(openPrice, row.price),
      low_price:     Math.min(openPrice, row.price),
      close_price:   row.price,
      source:        row.source,
      is_validated:  true,
      is_tentative:  false,
      fetched_at:    new Date().toISOString(),
    }, { onConflict: 'commodity_id,date' })

    results.success.push(slug)
  }

  // Log eksekusi
  await supabase.from('pipeline_logs').insert({
    run_at:        new Date().toISOString(),
    duration_ms:   Date.now() - startTime,
    source:        'pihps',
    success_count: results.success.length,
    failed_count:  results.failed.length,
    skipped_count: results.skipped.length,
  })

  return NextResponse.json({
    message: 'Pipeline completed',
    duration_ms: Date.now() - startTime,
    results,
  })
}

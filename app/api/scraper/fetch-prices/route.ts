/**
 * app/api/scraper/fetch-prices/route.ts
 * GitHub: deyogaid/TaniCuan
 *
 * Route ini adalah proxy tipis ke Supabase Edge Function.
 * Logika scraping sepenuhnya di Edge Function agar tidak
 * terbatas oleh Vercel Function timeout (10 detik).
 *
 * Supabase Edge Function URL:
 * https://xllugmlyytdrlwmfvtnc.supabase.co/functions/v1/fetch-prices
 */

import { NextRequest, NextResponse } from 'next/server'

const EDGE_FUNCTION_URL =
  'https://xllugmlyytdrlwmfvtnc.supabase.co/functions/v1/fetch-prices'

export async function GET(request: NextRequest) {
  // Verifikasi dari Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delegasikan ke Supabase Edge Function
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(25000), // 25 detik (Vercel max 30 detik)
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })

  } catch (err) {
    console.error('[Scraper Route] Edge function call failed:', err)
    return NextResponse.json(
      { error: 'Edge function unreachable', detail: (err as Error).message },
      { status: 503 }
    )
  }
}
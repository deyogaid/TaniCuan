/**
 * app/api/notifications/morning-alert/route.ts
 *
 * App Router Route Handler — TypeScript
 * Dipanggil Cron 04:30 WIB (20:30 UTC)
 *
 * CATATAN: Twilio tidak ada di package.json.
 * Opsi yang tersedia di stack ini:
 *   1. Supabase Edge Functions dengan Twilio (server-side, di luar Next.js)
 *   2. Web Push API (untuk PWA yang sudah install app)
 *   3. Resend/SendGrid email (ada di Vercel marketplace)
 * 
 * Fase 1 MVP: Menggunakan Web Push Notification (VAPID)
 * Twilio WhatsApp dapat ditambahkan saat `pnpm add twilio` dilakukan
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────
interface CommoditySignal {
  signal_color: string
  signal_label: string
  action_text: string
  price_mode: number
  commodities: {
    id: string
    name: string
  }
}

// ─── Format pesan notifikasi ──────────────────────────────────────────────────
function formatPushPayload(
  farmerName: string,
  signals: CommoditySignal[]
) {
  const signalEmoji: Record<string, string> = {
    GREEN: '🟢', YELLOW: '🟡', RED: '🔴'
  }

  const topSignal = signals[0]
  const emoji = signalEmoji[topSignal?.signal_color] ?? '📊'

  // Notifikasi push: judul + body singkat
  return {
    title: `🌾 Harga Pagi Ini — ${new Date().toLocaleDateString('id-ID', { weekday: 'long' })}`,
    body: signals.length === 1
      ? `${emoji} ${topSignal.commodities.name}: Rp ${Math.round(topSignal.price_mode).toLocaleString('id-ID')}/kg — ${topSignal.signal_label}`
      : `${emoji} ${topSignal.commodities.name} & ${signals.length - 1} komoditas lain membutuhkan perhatian`,
    data: {
      url: '/dashboard',
      signal_color: topSignal?.signal_color,
      commodity_id: topSignal?.commodities.id,
    },
  }
}

// ─── Kirim Web Push Notification via VAPID ───────────────────────────────────
async function sendWebPush(
  subscription: {
    endpoint: string
    p256dh: string
    auth: string
  },
  payload: object
): Promise<boolean> {
  // Menggunakan Web Push protocol standar (tanpa library tambahan)
  // Vercel mendukung web-push via fetch ke endpoint langsung
  // Untuk production, tambahkan: pnpm add web-push @types/web-push
  
  try {
    // Simplified: kirim fetch ke push endpoint langsung
    // Fase 1 MVP — push subscription disimpan di DB saat user install PWA
    const res = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: JSON.stringify(payload),
    })
    return res.ok || res.status === 201
  } catch {
    return false
  }
}

// ─── GET /api/notifications/morning-alert (Cron Entry) ───────────────────────
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // 1. Ambil semua sinyal aktif
  const { data: signals } = await supabase
    .from('commodity_signals')
    .select(`
      signal_color, signal_label, action_text, price_mode,
      commodities ( id, name )
    `)
    .gte('valid_until', new Date().toISOString()) as {
      data: CommoditySignal[] | null
    }

  if (!signals || signals.length === 0) {
    return NextResponse.json({ message: 'No active signals' })
  }

  // 2. Ambil push subscriptions aktif
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select(`
      endpoint, p256dh, auth, user_id,
      users ( name )
    `)
    .eq('is_active', true)

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: 'No push subscribers' })
  }

  const results = { sent: 0, failed: 0 }

  // 3. Kirim notifikasi per subscriber
  for (const sub of subscriptions) {
    const payload = formatPushPayload(
      (sub.users as { name: string } | null)?.name ?? 'Petani',
      signals
    )

    const success = await sendWebPush(
      { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
      payload
    )

    if (success) {
      results.sent++
      await supabase.from('notification_logs').insert({
        user_id:  sub.user_id,
        type:     'morning_alert',
        channel:  'web_push',
        status:   'sent',
        sent_at:  new Date().toISOString(),
      })
    } else {
      results.failed++
      // Nonaktifkan subscription yang gagal berulang kali (implementasi lanjut)
    }
  }

  return NextResponse.json({
    message: 'Morning alert completed',
    results,
    timestamp: new Date().toISOString(),
  })
}

/**
 * app/api/transactions/route.ts
 *
 * App Router Route Handler — TypeScript
 * Pencatatan transaksi + credit scoring
 * 
 * CATATAN: Ethers.js TIDAK diinstall di project ini.
 * Blockchain hash menggunakan crypto bawaan Node.js (tersedia di Next.js)
 * Polygon integration dapat ditambahkan di Fase 3 via Vercel Edge Function
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createHash } from 'crypto'

// ─── Validation Schema ────────────────────────────────────────────────────────
const TransactionSchema = z.object({
  commodity_id:   z.string().uuid(),
  quantity:       z.number().positive(),
  price_per_unit: z.number().positive(),
  buyer_info:     z.record(z.unknown()).optional(),
  notes:          z.string().max(500).optional(),
})

// ─── Hash deterministik (tanpa ethers.js) ────────────────────────────────────
function createTxHash(data: object): string {
  const str = JSON.stringify(data, Object.keys(data).sort())
  return 'agri_' + createHash('sha256').update(str).digest('hex')
}

// ─── Credit Score Computation ─────────────────────────────────────────────────
interface TxRecord {
  total_amount: number
  created_at: string
  blockchain_confirmed: boolean
}

function computeCreditScore(transactions: TxRecord[], trustScore = 5.0): {
  score: number
  breakdown: Record<string, number>
} {
  if (transactions.length === 0) {
    return { score: 0, breakdown: { basis: 0 } }
  }

  // Komponen 1: Volume transaksi (0–300)
  const volumeScore = Math.min(300, transactions.length * 15)

  // Komponen 2: Total nilai (0–200, log scale)
  const totalVolume = transactions.reduce((s, t) => s + t.total_amount, 0)
  const valueScore = Math.min(200, Math.log10(totalVolume + 1) * 40)

  // Komponen 3: Konsistensi 6 bulan terakhir (0–200)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const activeMonths = new Set(
    transactions
      .filter((t) => new Date(t.created_at) >= sixMonthsAgo)
      .map((t) => t.created_at.slice(0, 7))
  ).size
  const consistencyScore = Math.min(200, activeMonths * 33)

  // Komponen 4: Reliability (0–200)
  const confirmed = transactions.filter((t) => t.blockchain_confirmed).length
  const reliabilityScore = Math.round((confirmed / transactions.length) * 200)

  // Komponen 5: Trust Score dari Data AI (0–100)
  const trustContribution = Math.round((trustScore / 10) * 100)

  const total = Math.round(
    volumeScore + valueScore + consistencyScore + reliabilityScore + trustContribution
  )

  return {
    score: Math.min(1000, total),
    breakdown: {
      volume_score:       Math.round(volumeScore),
      value_score:        Math.round(valueScore),
      consistency_score:  Math.round(consistencyScore),
      reliability_score:  reliabilityScore,
      trust_contribution: trustContribution,
    },
  }
}

// ─── POST /api/transactions — Catat Transaksi Baru ────────────────────────────
export async function POST(request: NextRequest) {
  // Verifikasi user yang login
  const supabaseUser = await createClient()
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = TransactionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data tidak valid', detail: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { commodity_id, quantity, price_per_unit, buyer_info, notes } = parsed.data
  const total_amount = quantity * price_per_unit
  const created_at = new Date().toISOString()

  // Buat hash transaksi (lokal, tanpa blockchain eksternal di Fase 1)
  const txHash = createTxHash({
    farmer_id: user.id, commodity_id, quantity, price_per_unit, total_amount, created_at,
  })

  const supabase = createServiceClient()

  const { data: tx, error: insertError } = await supabase
    .from('transactions')
    .insert({
      farmer_id:            user.id,
      commodity_id,
      quantity,
      price_per_unit,
      total_amount,
      buyer_info:           buyer_info ?? {},
      notes:                notes ?? null,
      blockchain_hash:      txHash,
      blockchain_confirmed: false,       // Phase 1: local hash, Phase 3: Polygon
      blockchain_network:   'local-sha256',
      created_at,
    })
    .select('id, total_amount, blockchain_hash')
    .single()

  if (insertError || !tx) {
    return NextResponse.json({ error: 'Gagal menyimpan transaksi' }, { status: 500 })
  }

  // Update credit score async (non-blocking)
  void updateCreditScore(supabase, user.id)

  return NextResponse.json({
    message: 'Transaksi berhasil dicatat',
    transaction: {
      id:                   tx.id,
      total_amount:         tx.total_amount,
      blockchain_hash:      tx.blockchain_hash,
      blockchain_confirmed: false,
    },
  }, { status: 201 })
}

// ─── GET /api/transactions — History + Credit Score ──────────────────────────
export async function GET(request: NextRequest) {
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') // 'history' | 'score'

  const supabase = createServiceClient()

  if (type === 'score') {
    const { data: score } = await supabase
      .from('farmer_credit_scores')
      .select('*')
      .eq('farmer_id', user.id)
      .single()

    if (!score) {
      const fresh = await updateCreditScore(supabase, user.id)
      return NextResponse.json(fresh)
    }

    const label =
      (score.score as number) >= 800 ? 'Sangat Terpercaya' :
      (score.score as number) >= 600 ? 'Terpercaya' :
      (score.score as number) >= 400 ? 'Cukup Terpercaya' :
      (score.score as number) >= 200 ? 'Sedang Dibangun' : 'Baru Bergabung'

    return NextResponse.json({
      score:              score.score,
      score_label:        label,
      score_max:          1000,
      credit_limit_rp:    (score.score as number) * 50_000,
      total_transactions: score.total_transactions,
      reliability_rate:   score.reliability_rate,
      updated_at:         score.updated_at,
    })
  }

  // Default: riwayat transaksi
  const { data: history } = await supabase
    .from('transactions')
    .select('*, commodities(name, slug)')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ transactions: history ?? [] })
}

// ─── Helper: Hitung ulang & simpan credit score ───────────────────────────────
async function updateCreditScore(
  supabase: ReturnType<typeof createServiceClient>,
  farmerId: string
) {
  const { data: txs } = await supabase
    .from('transactions')
    .select('total_amount, created_at, blockchain_confirmed')
    .eq('farmer_id', farmerId)

  const { data: userProfile } = await supabase
    .from('users')
    .select('trust_score')
    .eq('id', farmerId)
    .single()

  const result = computeCreditScore(
    (txs ?? []) as TxRecord[],
    (userProfile?.trust_score as number | null) ?? 5.0
  )

  await supabase.from('farmer_credit_scores').upsert({
    farmer_id:          farmerId,
    score:              result.score,
    total_transactions: (txs ?? []).length,
    total_volume:       (txs ?? []).reduce((s, t) => s + (t.total_amount as number), 0),
    reliability_rate:   (txs ?? []).filter((t) => t.blockchain_confirmed).length / Math.max(1, (txs ?? []).length),
    score_breakdown:    result.breakdown,
    updated_at:         new Date().toISOString(),
  }, { onConflict: 'farmer_id' })

  return result
}

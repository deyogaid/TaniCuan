/**
 * app/api/auth/otp/route.ts
 *
 * App Router Route Handler — TypeScript
 * Menggunakan Supabase Phone Auth bawaan (tanpa Twilio eksternal)
 * Supabase sudah support OTP SMS/WhatsApp via provider Twilio bawaan
 * → Konfigurasi di Supabase Dashboard > Auth > Phone > Provider
 *
 * POST /api/auth/otp/request
 * POST /api/auth/otp/verify
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

// ─── Validation Schemas (Zod sudah ada di package.json) ──────────────────────
const RequestSchema = z.object({
  phone: z.string().min(10).max(15),
  action: z.enum(['request', 'verify']),
  token: z.string().length(6).optional(), // Untuk verify
})

// ─── Normalisasi Nomor HP Indonesia ──────────────────────────────────────────
function normalizePhone(phone: string): string | null {
  let cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('08'))   cleaned = '628' + cleaned.slice(2)
  else if (cleaned.startsWith('8')) cleaned = '628' + cleaned.slice(1)
  else if (cleaned.startsWith('0062')) cleaned = '62' + cleaned.slice(4)

  if (!cleaned.startsWith('62') || cleaned.length < 11 || cleaned.length > 15) {
    return null
  }
  return '+' + cleaned
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  // Buat Supabase client yang bisa set cookies (untuk session)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Validasi body
  const body = await request.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Input tidak valid', detail: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { phone, action, token } = parsed.data
  const normalizedPhone = normalizePhone(phone)

  if (!normalizedPhone) {
    return NextResponse.json(
      { error: 'Format nomor HP tidak valid. Gunakan: 08xxxxxxxxxx' },
      { status: 400 }
    )
  }

  // ── REQUEST OTP ────────────────────────────────────────────────────────────
  if (action === 'request') {
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        // channel: 'whatsapp' — aktifkan jika provider WA dikonfigurasi di Supabase
        channel: 'sms',
        shouldCreateUser: true, // Auto-create user baru
      },
    })

    if (error) {
      // Rate limit dari Supabase
      if (error.message.includes('rate limit') || error.status === 429) {
        return NextResponse.json(
          { error: 'Terlalu banyak permintaan. Tunggu beberapa menit.' },
          { status: 429 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'OTP berhasil dikirim',
      phone: normalizedPhone,
      expires_in: 300,
    })
  }

  // ── VERIFY OTP ─────────────────────────────────────────────────────────────
  if (action === 'verify') {
    if (!token) {
      return NextResponse.json({ error: 'Token OTP wajib diisi' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token,
      type: 'sms',
    })

    if (error) {
      return NextResponse.json(
        { error: 'OTP tidak valid atau sudah kadaluarsa' },
        { status: 401 }
      )
    }

    // Cek apakah profil sudah lengkap
    const { data: profile } = await supabase
      .from('farmer_profiles')
      .select('full_name, province')
      .eq('id', data.user?.id)
      .single()

    const isProfileComplete = !!(profile?.full_name && profile?.province)

    return NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: data.user?.id,
        phone: normalizedPhone,
        is_new_user: !profile,
        is_profile_complete: isProfileComplete,
      },
      redirect: isProfileComplete ? '/dashboard' : '/setup-profile',
    })
  }

  return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
}

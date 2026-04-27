import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

// GET /api/transactions - Get transactions with optional filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const commodityId = searchParams.get('commodityId')
        const marketId = searchParams.get('marketId')
        const type = searchParams.get('type') as 'buy' | 'sell' | null
        const limit = parseInt(searchParams.get('limit') || '50')

        let query = supabase
            .from('transactions')
            .select(`
        *,
        commodity:commodities(name, category),
        market:markets(name)
      `)
            .order('transaction_date', { ascending: false })
            .limit(limit)

        if (commodityId) {
            query = query.eq('commodity_id', commodityId)
        }

        if (marketId) {
            query = query.eq('market_id', marketId)
        }

        if (type) {
            query = query.eq('transaction_type', type)
        }

        const { data, error } = await query

        if (error) throw error

        return new Response(JSON.stringify(data || []), {
            headers: {
                'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
            }
        })

    } catch (error) {
        console.error('Transactions GET error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        )
    }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            commodity_id,
            market_id,
            transaction_type,
            quantity,
            price_per_unit,
            transaction_date,
            notes
        } = body

        // Validation
        if (!commodity_id || !market_id || !transaction_type || !quantity || !price_per_unit) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (!['buy', 'sell'].includes(transaction_type)) {
            return NextResponse.json(
                { error: 'Invalid transaction type' },
                { status: 400 }
            )
        }

        const total_amount = quantity * price_per_unit

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                commodity_id,
                market_id,
                transaction_type,
                quantity,
                price_per_unit,
                total_amount,
                transaction_date: transaction_date || new Date().toISOString().split('T')[0],
                notes
            })
            .select(`
        *,
        commodity:commodities(name, category),
        market:markets(name)
      `)
            .single()

        if (error) throw error

        return NextResponse.json(data, { status: 201 })

    } catch (error) {
        console.error('Transactions POST error:', error)
        return NextResponse.json(
            { error: 'Failed to create transaction' },
            { status: 500 }
        )
    }
}
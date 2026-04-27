'use client'

import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import type { Transaction } from '@/lib/types'

// Create client inside functions to avoid SSR issues
function getSupabaseClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

async function fetchTransactions(filters?: {
    commodityId?: string
    marketId?: string
    type?: 'buy' | 'sell'
    limit?: number
}): Promise<Transaction[]> {
    const supabase = getSupabaseClient()
    let query = supabase
        .from('transactions')
        .select(`
      *,
      commodity:commodities(name, category),
      market:markets(name)
    `)
        .order('transaction_date', { ascending: false })

    if (filters?.commodityId) {
        query = query.eq('commodity_id', filters.commodityId)
    }

    if (filters?.marketId) {
        query = query.eq('market_id', filters.marketId)
    }

    if (filters?.type) {
        query = query.eq('transaction_type', filters.type)
    }

    if (filters?.limit) {
        query = query.limit(filters.limit)
    } else {
        query = query.limit(50)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
}

async function createTransaction(transaction: {
    commodity_id: string
    market_id: string
    transaction_type: 'buy' | 'sell'
    quantity: number
    price_per_unit: number
    transaction_date?: string
    notes?: string
}): Promise<Transaction> {
    const supabase = getSupabaseClient()

    const total_amount = transaction.quantity * transaction.price_per_unit

    const { data, error } = await supabase
        .from('transactions')
        .insert({
            ...transaction,
            total_amount,
            transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0]
        })
        .select(`
      *,
      commodity:commodities(name, category),
      market:markets(name)
    `)
        .single()

    if (error) throw error
    return data
}

// SWR Hooks
export function useTransactions(filters?: {
    commodityId?: string
    marketId?: string
    type?: 'buy' | 'sell'
    limit?: number
}) {
    const key = filters
        ? ['transactions', filters.commodityId, filters.marketId, filters.type, filters.limit]
        : ['transactions']

    return useSWR(key, () => fetchTransactions(filters), {
        revalidateOnFocus: false,
        dedupingInterval: 30000, // 30 seconds
    })
}

export function useCreateTransaction() {
    return {
        create: createTransaction
    }
}
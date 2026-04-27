'use client'

import useSWR from 'swr'
import type { PricePrediction } from '@/lib/types'

interface PredictionResponse {
    commodity_id: string
    signal: {
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
    price_mode: number
    predictions: PricePrediction[]
    cached: boolean
}

export function usePredictions(commodityId: string | null, marketId: string | null, days: number = 7) {
    const { data, error, isLoading, mutate } = useSWR<PredictionResponse>(
        commodityId && marketId ? `/api/predictions/${commodityId}?days=${days}&marketId=${marketId}` : null,
        async (url: string) => {
            const response = await fetch(url)
            if (!response.ok) throw new Error('Failed to fetch predictions')
            return response.json()
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
            keepPreviousData: true,
            revalidateIfStale: false,
        }
    )

    return {
        data,
        isLoading,
        error,
        refresh: mutate,
    }
}
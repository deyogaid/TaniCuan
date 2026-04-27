/**
 * Hook untuk fetch data pasar terdekat dengan radius filter
 * Menggunakan Haversine formula untuk menghitung jarak geografis
 */

'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import type { Market } from '@/lib/types'
import type { GeoLocation } from '@/lib/distance-utils'
import {
    filterMarketsByRadius,
    findNearestMarket,
    calculateDistance,
} from '@/lib/distance-utils'

// Create client inside functions to avoid SSR issues
function getSupabaseClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

/**
 * Fetch semua pasar yang active dengan koordinat lengkap
 */
async function fetchMarketsWithCoordinates(): Promise<Market[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from('markets')
        .select('id, name, city, province, latitude, longitude, is_active, is_primary, created_at')
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('name')

    if (error) throw error
    return data || []
}

/**
 * Hook untuk fetch pasar-pasar terdekat dalam radius tertentu
 * Filter dilakukan di client menggunakan Haversine formula
 *
 * @param farmerLocation Lokasi petani (latitude, longitude)
 * @param radiusKm Radius pencarian dalam km (default: 50km)
 * @returns Pasar-pasar terdekat dengan jarak, isLoading, error, refetch
 *
 * @example
 * const { markets, nearest, isLoading } = useNearestMarkets(
 *   { latitude: -6.2371, longitude: 106.8829 },
 *   50
 * )
 */
export function useNearestMarkets(
    farmerLocation: GeoLocation | null,
    radiusKm: number = 50
) {
    const { data: allMarkets, error, isLoading, mutate } = useSWR(
        'markets-with-coordinates',
        fetchMarketsWithCoordinates,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1 minute
        }
    )

    // Filter markets berdasarkan radius
    const nearbyMarkets = useCallback(() => {
        if (!allMarkets || !farmerLocation) return []
        return filterMarketsByRadius(allMarkets, farmerLocation, radiusKm)
    }, [allMarkets, farmerLocation, radiusKm])

    // Find nearest market
    const nearest = useCallback(() => {
        if (!allMarkets || !farmerLocation) return undefined
        return findNearestMarket(allMarkets, farmerLocation)
    }, [allMarkets, farmerLocation])

    // Get distance to specific market
    const getDistanceToMarket = useCallback(
        (market: Market) => {
            if (!farmerLocation || !market.latitude || !market.longitude) return null
            return calculateDistance(farmerLocation, {
                latitude: market.latitude,
                longitude: market.longitude,
            })
        },
        [farmerLocation]
    )

    return {
        markets: nearbyMarkets(),
        nearestMarket: nearest(),
        allMarkets,
        isLoading,
        error,
        refetch: mutate,
        getDistanceToMarket,
    }
}

/**
 * Hook untuk fetch pasar terdekat saja (single result)
 * Lebih efficient jika hanya butuh 1 pasar terdekat
 *
 * @param farmerLocation Lokasi petani (latitude, longitude)
 * @returns Pasar terdekat dengan jarak, isLoading, error
 */
export function useNearestMarket(farmerLocation: GeoLocation | null) {
    const { markets, nearestMarket, isLoading, error } = useNearestMarkets(farmerLocation, Infinity)

    return {
        market: nearestMarket,
        isLoading,
        error,
    }
}

/**
 * Hook untuk batch check jarak ke multiple markets
 * Useful untuk menampilkan jarak di commodity detail atau transaction page
 *
 * @param farmerLocation Lokasi petani
 * @param marketIds Array of market IDs untuk dicek jaraknya
 */
export function useMarketsDistance(
    farmerLocation: GeoLocation | null,
    marketIds: string[] | null = null
) {
    const { allMarkets, isLoading, error } = useSWR(
        'markets-with-coordinates',
        fetchMarketsWithCoordinates,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    )

    // Filter by specific IDs if provided
    const selectedMarkets = allMarkets?.filter(m => !marketIds || marketIds.includes(m.id)) || []

    // Calculate distances
    const distances = selectedMarkets
        .map(market => {
            if (!farmerLocation || !market.latitude || !market.longitude) {
                return { marketId: market.id, market, distance: null }
            }
            const distance = calculateDistance(farmerLocation, {
                latitude: market.latitude,
                longitude: market.longitude,
            })
            return { marketId: market.id, market, distance }
        })
        .sort((a, b) => {
            if (a.distance === null) return 1
            if (b.distance === null) return -1
            return a.distance - b.distance
        })

    return {
        distances,
        isLoading,
        error,
    }
}

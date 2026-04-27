'use client'

import React, { useState } from 'react'
import { useNearestMarkets } from '@/lib/hooks/use-nearest-markets'
import { formatDistance, bearingToDirection, calculateBearing } from '@/lib/distance-utils'
import type { GeoLocation } from '@/lib/distance-utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation } from 'lucide-react'

/**
 * Component untuk menampilkan pasar-pasar terdekat dari lokasi petani
 * Menggunakan Haversine formula untuk menghitung jarak dengan radius 50km
 */
interface NearestMarketsProps {
    /** Lokasi petani (latitude, longitude) */
    farmerLocation: GeoLocation | null
    /** Radius pencarian dalam km (default: 50km) */
    radiusKm?: number
    /** Callback saat market dipilih */
    onSelectMarket?: (marketId: string) => void
}

export function NearestMarketsCard({
    farmerLocation,
    radiusKm = 50,
    onSelectMarket,
}: NearestMarketsProps) {
    const { markets, nearestMarket, isLoading, error } = useNearestMarkets(
        farmerLocation,
        radiusKm
    )
    const [expanded, setExpanded] = useState(false)

    if (!farmerLocation) {
        return (
            <Card className="p-4 text-center text-muted-foreground">
                <MapPin className="w-4 h-4 mx-auto mb-2" />
                <p>Aktifkan lokasi untuk melihat pasar terdekat</p>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="p-4 bg-destructive/10 border-destructive/30">
                <p className="text-sm text-destructive">Gagal memuat data pasar</p>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <Card className="p-4">
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                </div>
            </Card>
        )
    }

    if (!nearestMarket) {
        return (
            <Card className="p-4 text-center text-muted-foreground">
                <MapPin className="w-4 h-4 mx-auto mb-2" />
                <p>Tidak ada pasar dalam radius {radiusKm}km</p>
            </Card>
        )
    }

    // Calculate bearing to nearest market
    const bearing = calculateBearing(farmerLocation, {
        latitude: nearestMarket.latitude!,
        longitude: nearestMarket.longitude!,
    })
    const direction = bearingToDirection(bearing)

    return (
        <div className="space-y-2">
            {/* Nearest Market Card */}
            <Card
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onSelectMarket?.(nearestMarket.id)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{nearestMarket.name}</h3>
                            {nearestMarket.is_primary && (
                                <Badge variant="default" className="text-xs">
                                    Utama
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">{nearestMarket.city}, {nearestMarket.province}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                            <Navigation className="w-4 h-4 text-primary" style={{
                                transform: `rotate(${bearing}deg)`
                            }} />
                            <p className="font-bold text-primary">{formatDistance(nearestMarket.distance)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{direction}</p>
                    </div>
                </div>
            </Card>

            {/* Show more markets if exists */}
            {markets.length > 1 && (
                <>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-primary hover:underline w-full text-center py-1"
                    >
                        {expanded ? 'Sembunyikan' : `Tampilkan ${markets.length - 1} pasar lainnya`}
                    </button>

                    {expanded && (
                        <div className="space-y-2 pt-2 border-t">
                            {markets.slice(1).map(market => (
                                <Card
                                    key={market.id}
                                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                                    onClick={() => onSelectMarket?.(market.id)}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{market.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {market.city}
                                            </p>
                                        </div>
                                        <div className="text-right whitespace-nowrap">
                                            <p className="font-semibold text-sm">{formatDistance(market.distance)}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Info text */}
            <p className="text-xs text-muted-foreground text-center pt-2">
                Menampilkan {markets.length} pasar dalam radius {radiusKm}km
            </p>
        </div>
    )
}

/**
 * Example usage dalam komponen lain
 * 
 * export default function FarmerDashboard() {
 *   const [farmerLocation, setFarmerLocation] = useState<GeoLocation | null>(null)
 * 
 *   useEffect(() => {
 *     // Get farmer location from geolocation API or form input
 *     if (navigator.geolocation) {
 *       navigator.geolocation.getCurrentPosition(position => {
 *         setFarmerLocation({
 *           latitude: position.coords.latitude,
 *           longitude: position.coords.longitude,
 *         })
 *       })
 *     }
 *   }, [])
 * 
 *   return (
 *     <NearestMarketsCard
 *       farmerLocation={farmerLocation}
 *       radiusKm={50}
 *       onSelectMarket={(marketId) => {
 *         console.log('Selected market:', marketId)
 *       }}
 *     />
 *   )
 * }
 */

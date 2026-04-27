'use client'

/**
 * EXAMPLE PAGE: Pencarian Pasar Terdekat
 * 
 * Ini adalah contoh implementasi lengkap dari fitur nearest markets
 * Bisa di-copy ke app/nearest-markets/page.tsx atau diintegrasikan ke page existing
 */

import { useState, useEffect } from 'react'
import { useNearestMarkets } from '@/lib/hooks/use-nearest-markets'
import { NearestMarketsCard } from '@/components/nearest-markets-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { GeoLocation } from '@/lib/distance-utils'
import { MapPin, Loader2, AlertCircle, Navigation } from 'lucide-react'
import { formatDistance, bearingToDirection, calculateBearing } from '@/lib/distance-utils'

export default function NearestMarketsExamplePage() {
    const [location, setLocation] = useState<GeoLocation | null>(null)
    const [radiusKm, setRadiusKm] = useState(50)
    const [manualInput, setManualInput] = useState(false)
    const [inputLat, setInputLat] = useState('')
    const [inputLon, setInputLon] = useState('')
    const [geoLoading, setGeoLoading] = useState(false)
    const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null)

    // Fetch nearest markets
    const {
        markets,
        nearestMarket,
        isLoading,
        error,
        getDistanceToMarket
    } = useNearestMarkets(location, radiusKm)

    // Get user's geolocation
    const handleGetLocation = () => {
        setGeoLoading(true)
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    })
                    setManualInput(false)
                    setGeoLoading(false)
                },
                (error) => {
                    console.error('Geolocation error:', error)
                    setGeoLoading(false)
                    alert('Tidak bisa mendapatkan lokasi. Silakan aktifkan GPS atau gunakan input manual.')
                }
            )
        } else {
            alert('Browser Anda tidak support Geolocation')
            setGeoLoading(false)
        }
    }

    // Handle manual location input
    const handleManualLocation = (e: React.FormEvent) => {
        e.preventDefault()
        const lat = parseFloat(inputLat)
        const lon = parseFloat(inputLon)

        if (isNaN(lat) || isNaN(lon)) {
            alert('Latitude dan Longitude harus berupa angka')
            return
        }

        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            alert('Koordinat tidak valid')
            return
        }

        setLocation({ latitude: lat, longitude: lon })
        setManualInput(false)
        setInputLat('')
        setInputLon('')
    }

    // Calculate bearing to selected market
    const selectedMarket = markets.find(m => m.id === selectedMarketId)
    let bearing = null
    let direction = null
    if (selectedMarket && location && selectedMarket.latitude && selectedMarket.longitude) {
        bearing = calculateBearing(location, {
            latitude: selectedMarket.latitude,
            longitude: selectedMarket.longitude,
        })
        direction = bearingToDirection(bearing)
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">🗺️ Pasar Terdekat</h1>
                    <p className="text-muted-foreground">
                        Cari pasar induk terdekat dengan lokasi Anda dalam radius hingga 200km
                    </p>
                </div>

                {/* Location Section */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">📍 Lokasi Petani</h2>

                    {location ? (
                        <div className="space-y-4">
                            {/* Current Location Display */}
                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Latitude</p>
                                        <p className="font-mono font-semibold">{location.latitude.toFixed(6)}°</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Longitude</p>
                                        <p className="font-mono font-semibold">{location.longitude.toFixed(6)}°</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setLocation(null)}
                                    >
                                        Ubah Lokasi
                                    </Button>
                                </div>
                            </div>

                            {/* Radius Control */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Radius Pencarian: <span className="font-bold text-primary">{radiusKm} km</span>
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    step="10"
                                    value={radiusKm}
                                    onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Geser untuk mengubah radius pencarian pasar
                                </p>
                            </div>
                        </div>
                    ) : manualInput ? (
                        /* Manual Input Form */
                        <form onSubmit={handleManualLocation} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Latitude</label>
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        placeholder="-6.2371"
                                        value={inputLat}
                                        onChange={(e) => setInputLat(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Contoh: -6.2371 (Jakarta)
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Longitude</label>
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        placeholder="106.8829"
                                        value={inputLon}
                                        onChange={(e) => setInputLon(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Contoh: 106.8829 (Jakarta)
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">
                                    Simpan Lokasi
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setManualInput(false)}
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    ) : (
                        /* No Location State */
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Aktifkan GPS untuk menemukan pasar terdekat secara otomatis
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleGetLocation}
                                    disabled={geoLoading}
                                    className="flex-1"
                                >
                                    {geoLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Mengambil Lokasi...
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Gunakan GPS
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setManualInput(true)}
                                    className="flex-1"
                                >
                                    Input Manual
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Markets Display */}
                {location && (
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">
                            📍 Pasar dalam Radius {radiusKm}km ({markets.length} pasar)
                        </h2>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg flex gap-2 mb-4">
                                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-destructive">Error</p>
                                    <p className="text-sm text-destructive/80">{error.message}</p>
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : markets.length === 0 ? (
                            <div className="bg-muted p-6 rounded-lg text-center">
                                <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    Tidak ada pasar dalam radius {radiusKm}km
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRadiusKm(radiusKm + 50)}
                                    className="mt-4"
                                >
                                    Perluas Radius +50km
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Nearest Market (Featured) */}
                                {nearestMarket && (
                                    <div className="mb-6">
                                        <Badge className="mb-2">Terdekat</Badge>
                                        <Card className="p-4 bg-primary/5 border-primary/20">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg">{nearestMarket.name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {nearestMarket.city}, {nearestMarket.province}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-primary">
                                                        {formatDistance(nearestMarket.distance)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">dari lokasi Anda</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* All Markets List */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm text-muted-foreground">
                                        Semua Pasar Terdekat
                                    </h3>
                                    {markets.map((market) => {
                                        const isSelected = selectedMarketId === market.id
                                        return (
                                            <Card
                                                key={market.id}
                                                className={`p-4 cursor-pointer transition-all ${isSelected
                                                        ? 'ring-2 ring-primary bg-primary/5'
                                                        : 'hover:bg-muted'
                                                    }`}
                                                onClick={() =>
                                                    setSelectedMarketId(isSelected ? null : market.id)
                                                }
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold">{market.name}</h4>
                                                            {market.is_primary && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Utama
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {market.city}, {market.province}
                                                        </p>

                                                        {/* Show bearing info when selected */}
                                                        {isSelected && bearing !== null && direction && (
                                                            <div className="mt-3 flex items-center gap-2 text-xs bg-muted p-2 rounded">
                                                                <Navigation
                                                                    className="w-4 h-4"
                                                                    style={{ transform: `rotate(${bearing}deg)` }}
                                                                />
                                                                <span>
                                                                    {direction} ({bearing.toFixed(0)}°)
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-xl font-bold">
                                                            {formatDistance(market.distance)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(market.distance / 1.6).toFixed(1)} mil
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Info Box */}
                <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <p className="text-sm">
                        <span className="font-semibold">💡 Informasi:</span> Menggunakan Haversine formula
                        untuk menghitung jarak akurat antara lokasi petani dan pasar induk.
                    </p>
                </Card>
            </div>
        </div>
    )
}

/**
 * Example coordinates untuk testing:
 * 
 * Jakarta Kramat Jati: -6.2371, 106.8829
 * Bandung Caringin: -6.9132, 107.6147
 * Yogyakarta Giwangan: -7.8386, 110.4133
 * Sidoarjo: -7.4628, 112.7190
 * 
 * Hitung jarak dari satu lokasi ke lokasi lain untuk testing
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, TrendingUp, Activity } from 'lucide-react'
import type { Market, CommodityPriceData } from '@/lib/types'
import { formatRupiah } from '@/lib/types'

interface MarketOverviewProps {
    market: Market
    commodityData: CommodityPriceData[]
}

export function MarketOverview({ market, commodityData }: MarketOverviewProps) {
    // Calculate market statistics
    const totalCommodities = commodityData.length
    const activeCommodities = commodityData.filter(item => item.ohlcData.length > 0).length
    const avgPrice = commodityData.reduce((sum, item) => sum + item.latestPrice, 0) / totalCommodities || 0
    const totalVolume = commodityData.reduce((sum, item) => {
        const latestVolume = item.ohlcData[item.ohlcData.length - 1]?.volume || 0
        return sum + latestVolume
    }, 0)

    const signalDistribution = {
        green: commodityData.filter(item => item.signal.signal === 'green').length,
        yellow: commodityData.filter(item => item.signal.signal === 'yellow').length,
        red: commodityData.filter(item => item.signal.signal === 'red').length,
    }

    const topCommodities = commodityData
        .sort((a, b) => b.latestPrice - a.latestPrice)
        .slice(0, 3)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {market.name}
                    {market.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                            Pasar Utama
                        </Badge>
                    )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    {market.location || 'Lokasi tidak tersedia'}
                    {market.province && `, ${market.province}`}
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold">{activeCommodities}</p>
                        <p className="text-xs text-muted-foreground">Komoditas Aktif</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold">{formatRupiah(avgPrice)}</p>
                        <p className="text-xs text-muted-foreground">Rata-rata Harga</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-2">
                            <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold">{totalVolume.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-muted-foreground">Total Volume</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg mx-auto mb-2">
                            <MapPin className="w-4 h-4 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold">{totalCommodities}</p>
                        <p className="text-xs text-muted-foreground">Total Komoditas</p>
                    </div>
                </div>

                {/* Signal Distribution */}
                <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">Distribusi Sinyal</h4>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1 text-xs">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span>{signalDistribution.green} Hijau</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <span>{signalDistribution.yellow} Kuning</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span>{signalDistribution.red} Merah</span>
                        </div>
                    </div>
                </div>

                {/* Top Commodities */}
                <div>
                    <h4 className="font-medium text-sm mb-2">Komoditas Teratas</h4>
                    <div className="space-y-2">
                        {topCommodities.map((commodity, index) => (
                            <div key={commodity.commodity.id} className="flex items-center justify-between text-sm">
                                <span className="truncate">{commodity.commodity.name}</span>
                                <span className="font-medium">{formatRupiah(commodity.latestPrice)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
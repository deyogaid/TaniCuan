'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react'
import type { CommodityPriceData } from '@/lib/types'
import { formatRupiah, formatShortRupiah } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SummaryStatsProps {
    data: CommodityPriceData[]
}

export function SummaryStats({ data }: SummaryStatsProps) {
    // Calculate summary statistics
    const totalVolume = data.reduce((sum, item) => {
        const latestVolume = item.ohlcData[item.ohlcData.length - 1]?.volume || 0
        return sum + latestVolume
    }, 0)

    const avgPrice = data.reduce((sum, item) => sum + item.latestPrice, 0) / data.length

    const positiveChanges = data.filter(item => item.priceChangePercent > 0).length
    const negativeChanges = data.filter(item => item.priceChangePercent < 0).length

    const greenSignals = data.filter(item => item.signal.signal === 'green').length
    const yellowSignals = data.filter(item => item.signal.signal === 'yellow').length
    const redSignals = data.filter(item => item.signal.signal === 'red').length

    const stats = [
        {
            label: 'Total Volume',
            value: totalVolume.toLocaleString('id-ID'),
            icon: BarChart3,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        },
        {
            label: 'Rata-rata Harga',
            value: formatShortRupiah(avgPrice),
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
        },
        {
            label: 'Harga Naik',
            value: `${positiveChanges}/${data.length}`,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
        },
        {
            label: 'Harga Turun',
            value: `${negativeChanges}/${data.length}`,
            icon: TrendingDown,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-950/20',
        },
    ]

    const signalStats = [
        { label: 'Sinyal Hijau', count: greenSignals, color: 'bg-green-500' },
        { label: 'Sinyal Kuning', count: yellowSignals, color: 'bg-yellow-500' },
        { label: 'Sinyal Merah', count: redSignals, color: 'bg-red-500' },
    ]

    return (
        <div className="space-y-4">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-0 shadow-sm">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                                    <stat.icon className={cn('w-4 h-4', stat.color)} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {stat.label}
                                    </p>
                                    <p className="text-sm font-bold truncate">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Signal Distribution */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-3">Distribusi Sinyal Lalu Lintas</h3>
                    <div className="flex items-center gap-4">
                        {signalStats.map((signal, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className={cn('w-3 h-3 rounded-full', signal.color)} />
                                <span className="text-sm text-muted-foreground">
                                    {signal.label}: {signal.count}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-1">
                        {signalStats.map((signal, index) => (
                            <div
                                key={index}
                                className={cn('h-2 rounded-full flex-1', signal.color)}
                                style={{ width: `${(signal.count / data.length) * 100}%` }}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
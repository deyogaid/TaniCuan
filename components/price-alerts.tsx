'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import type { CommodityPriceData } from '@/lib/types'
import { formatRupiah, formatPercent } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PriceAlertsProps {
    data: CommodityPriceData[]
    threshold?: number // percentage threshold for alerts
}

export function PriceAlerts({ data, threshold = 5 }: PriceAlertsProps) {
    // Filter commodities with significant price changes
    const significantChanges = data.filter(item =>
        Math.abs(item.priceChangePercent) >= threshold
    )

    const alerts = significantChanges.map(item => ({
        ...item,
        type: item.priceChangePercent > 0 ? 'increase' : 'decrease',
        severity: Math.abs(item.priceChangePercent) >= 10 ? 'high' : 'medium',
    }))

    if (alerts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Peringatan Harga
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Tidak ada perubahan harga signifikan ({threshold}%+)
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Peringatan Harga
                    <Badge variant="outline" className="text-xs">
                        {threshold}% threshold
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div
                            key={alert.commodity.id}
                            className={cn(
                                'flex items-center justify-between p-3 rounded-lg border',
                                alert.severity === 'high'
                                    ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20'
                                    : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center',
                                    alert.type === 'increase'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                )}>
                                    {alert.type === 'increase' ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm truncate">
                                        {alert.commodity.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Harga saat ini: {formatRupiah(alert.latestPrice)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={cn(
                                    'flex items-center gap-1 text-sm font-semibold',
                                    alert.type === 'increase' ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {alert.type === 'increase' ? (
                                        <TrendingUp className="w-3 h-3" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3" />
                                    )}
                                    {formatPercent(alert.priceChangePercent)}
                                </div>
                                <Badge
                                    variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                                    className="text-xs mt-1"
                                >
                                    {alert.severity === 'high' ? 'Tinggi' : 'Sedang'}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
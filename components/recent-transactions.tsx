'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTransactions } from '@/lib/hooks/use-transactions'
import { formatRupiah, formatDate } from '@/lib/types'
import { ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentTransactionsProps {
    marketId?: string | null
    limit?: number
}

export function RecentTransactions({ marketId, limit = 5 }: RecentTransactionsProps) {
    const { data: transactions, isLoading, error } = useTransactions({
        marketId: marketId || undefined,
        limit,
    })

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Transaksi Terbaru
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-pulse">
                                <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !transactions || transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Transaksi Terbaru
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Belum ada data transaksi
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Transaksi Terbaru
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center',
                                    transaction.transaction_type === 'buy'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                )}>
                                    {transaction.transaction_type === 'buy' ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm truncate">
                                            {transaction.commodity?.name || 'Unknown'}
                                        </p>
                                        <Badge
                                            variant={transaction.transaction_type === 'buy' ? 'default' : 'destructive'}
                                            className="text-xs"
                                        >
                                            {transaction.transaction_type === 'buy' ? 'Beli' : 'Jual'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {transaction.market?.name || 'Unknown Market'} • {formatDate(transaction.transaction_date)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-sm">
                                    {formatRupiah(transaction.total_amount)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {transaction.quantity} {transaction.commodity?.name ? 'kg' : 'unit'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
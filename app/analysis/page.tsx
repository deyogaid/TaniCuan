'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTransactions } from '@/lib/hooks/use-transactions'
import { MobileNav } from '@/components/mobile-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/types'
import { Plus, TrendingUp, TrendingDown, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AnalysisPage() {
    const router = useRouter()
    const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')

    const { data: transactions, isLoading, error } = useTransactions({
        type: filter === 'all' ? undefined : filter,
        limit: 100
    })

    const totalBuy = transactions?.filter(t => t.transaction_type === 'buy').reduce((sum, t) => sum + t.total_amount, 0) || 0
    const totalSell = transactions?.filter(t => t.transaction_type === 'sell').reduce((sum, t) => sum + t.total_amount, 0) || 0
    const profit = totalSell - totalBuy

    const handleTabChange = (tab: string) => {
        if (tab === 'home') {
            router.push('/')
        } else if (tab === 'alerts') {
            // TODO: implement alerts page
        } else if (tab === 'profile') {
            router.push('/profile')
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <h1 className="font-bold text-lg">Analisis Transaksi</h1>
                        <p className="text-xs opacity-80">Riwayat dan performa</p>
                    </div>
                    <Button size="sm" variant="secondary" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 pb-20">
                {/* Summary Cards */}
                <section className="py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-muted-foreground">Total Beli</span>
                                </div>
                                <p className="font-semibold text-red-600">{formatRupiah(totalBuy)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-muted-foreground">Total Jual</span>
                                </div>
                                <p className="font-semibold text-green-600">{formatRupiah(totalSell)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className={cn(
                        'border-2',
                        profit >= 0 ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                    )}>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Receipt className="w-4 h-4" />
                                <span className="text-sm text-muted-foreground">Laba/Rugi</span>
                            </div>
                            <p className={cn(
                                'font-semibold text-lg',
                                profit >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                                {profit >= 0 ? '+' : ''}{formatRupiah(profit)}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Filter Tabs */}
                <section className="mb-4">
                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: 'Semua' },
                            { id: 'buy', label: 'Pembelian' },
                            { id: 'sell', label: 'Penjualan' }
                        ].map(tab => (
                            <Button
                                key={tab.id}
                                variant={filter === tab.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(tab.id as any)}
                                className="flex-1"
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </section>

                {/* Transactions List */}
                <section>
                    <h2 className="font-semibold mb-3">Riwayat Transaksi</h2>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <Card key={i}>
                                    <CardContent className="p-4">
                                        <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                                        <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : error ? (
                        <Card>
                            <CardContent className="p-4 text-center text-muted-foreground">
                                <p>Gagal memuat data transaksi</p>
                            </CardContent>
                        </Card>
                    ) : transactions && transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.map(transaction => (
                                <Card key={transaction.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium">{transaction.commodity?.name}</h3>
                                                    <Badge
                                                        variant={transaction.transaction_type === 'buy' ? 'destructive' : 'default'}
                                                        className="text-xs"
                                                    >
                                                        {transaction.transaction_type === 'buy' ? 'Beli' : 'Jual'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.market?.name} • {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatRupiah(transaction.total_amount)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.quantity} kg × {formatRupiah(transaction.price_per_unit)}
                                                </p>
                                            </div>
                                        </div>
                                        {transaction.notes && (
                                            <p className="text-sm text-muted-foreground mt-2">{transaction.notes}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium mb-1">Belum ada transaksi</p>
                                <p className="text-sm">Transaksi Anda akan muncul di sini</p>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </main>

            {/* Mobile Navigation */}
            <MobileNav activeTab="analysis" onTabChange={handleTabChange} />
        </div>
    )
}
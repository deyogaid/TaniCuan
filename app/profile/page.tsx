'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MobileNav } from '@/components/mobile-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    User,
    Settings,
    Bell,
    Shield,
    LogOut,
    Edit,
    CreditCard,
    TrendingUp,
    Mail,
    Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)

    // Mock user data - in real app, this would come from auth context
    const user = {
        name: 'Ahmad Tani',
        email: 'ahmad.tani@example.com',
        phone: '+62 812-3456-7890',
        avatar: null,
        joinDate: 'Januari 2024',
        creditScore: 85,
        totalTransactions: 24,
        totalVolume: '2.5 ton',
        preferredMarkets: ['Jakarta', 'Surabaya'],
        notifications: {
            priceAlerts: true,
            marketUpdates: true,
            weeklyReports: false
        }
    }

    const handleTabChange = (tab: string) => {
        if (tab === 'home') {
            router.push('/')
        } else if (tab === 'analysis') {
            router.push('/analysis')
        } else if (tab === 'community') {
            router.push('/community')
        } else if (tab === 'alerts') {
            // TODO: implement alerts page
        }
    }

    const menuItems = [
        {
            id: 'edit-profile',
            label: 'Edit Profil',
            icon: Edit,
            action: () => setIsEditing(!isEditing)
        },
        {
            id: 'notifications',
            label: 'Pengaturan Notifikasi',
            icon: Bell,
            action: () => console.log('Notifications settings')
        },
        {
            id: 'security',
            label: 'Keamanan & Privasi',
            icon: Shield,
            action: () => console.log('Security settings')
        },
        {
            id: 'billing',
            label: 'Pembayaran & Langganan',
            icon: CreditCard,
            action: () => console.log('Billing settings')
        },
        {
            id: 'logout',
            label: 'Keluar',
            icon: LogOut,
            action: () => console.log('Logout'),
            danger: true
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <h1 className="font-bold text-lg">Profil Pengguna</h1>
                        <p className="text-xs opacity-80">Kelola akun & preferensi</p>
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsEditing(!isEditing)}
                        className="gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 pb-20">
                {/* Profile Header */}
                <section className="py-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={user.avatar || undefined} />
                                    <AvatarFallback className="text-lg font-semibold">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold">{user.name}</h2>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-sm text-muted-foreground">Bergabung {user.joinDate}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Stats */}
                <section className="py-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <div className="text-2xl font-bold text-primary">{user.creditScore}</div>
                                <p className="text-xs text-muted-foreground">Credit Score</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <div className="text-2xl font-bold text-primary">{user.totalTransactions}</div>
                                <p className="text-xs text-muted-foreground">Transaksi</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <div className="text-2xl font-bold text-primary">{user.totalVolume}</div>
                                <p className="text-xs text-muted-foreground">Volume</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Contact Info */}
                <section className="py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Informasi Kontak</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{user.phone}</p>
                                    <p className="text-xs text-muted-foreground">Telepon</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Preferred Markets */}
                <section className="py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Pasar Utama</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {user.preferredMarkets.map(market => (
                                    <Badge key={market} variant="secondary">{market}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Menu */}
                <section className="py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Pengaturan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {menuItems.map(item => {
                                const Icon = item.icon
                                return (
                                    <button
                                        key={item.id}
                                        onClick={item.action}
                                        className={cn(
                                            'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                                            item.danger
                                                ? 'text-destructive hover:bg-destructive/10'
                                                : 'hover:bg-muted'
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                )
                            })}
                        </CardContent>
                    </Card>
                </section>
            </main>

            {/* Mobile Navigation */}
            <MobileNav activeTab="profile" onTabChange={handleTabChange} />
        </div>
    )
}
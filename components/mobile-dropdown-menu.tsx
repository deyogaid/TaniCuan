'use client'

import { useState, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Menu, Home, BarChart3, Users, Bell, User, Zap } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useFastPageLoad } from '@/lib/hooks/use-fast-page-load'
import { cn } from '@/lib/utils'

const menuItems = [
    { id: 'home', label: 'Beranda', href: '/', icon: Home },
    { id: 'analysis', label: 'Analisis', href: '/analysis', icon: BarChart3 },
    { id: 'community', label: 'Komunitas', href: '/community', icon: Users },
    { id: 'alerts', label: 'Notifikasi', href: '/notifications/morning-alert', icon: Bell },
    { id: 'profile', label: 'Profil', href: '/profile', icon: User },
]

export function MobileDropdownMenu() {
    const pathname = usePathname()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const activeItem = useMemo(
        () => menuItems.find(item => pathname.startsWith(item.href))?.id || 'home',
        [pathname]
    )

    useFastPageLoad(menuItems.map(item => item.href))

    const handleNavigation = async (href: string) => {
        setOpen(false)
        await router.push(href)
    }

    const handleFastLoad = () => {
        menuItems.forEach(item => router.prefetch(item.href))
    }

    return (
        <div className="flex items-center justify-between gap-3">
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-primary hover:text-primary"
                        aria-label="Buka menu navigasi"
                    >
                        <Menu className="w-4 h-4" />
                        Menu
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 p-1">
                    <DropdownMenuLabel className="px-2 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Navigasi Cepat
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {menuItems.map(item => {
                        const Icon = item.icon
                        const isActive = activeItem === item.id

                        return (
                            <DropdownMenuItem
                                key={item.id}
                                onSelect={() => handleNavigation(item.href)}
                                onPointerEnter={() => router.prefetch(item.href)}
                                className={cn(
                                    'rounded-md px-2 py-2 text-sm',
                                    isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </div>
                            </DropdownMenuItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            <button
                type="button"
                onClick={handleFastLoad}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
                <Zap className="w-4 h-4" />
                Muat Cepat
            </button>
        </div>
    )
}

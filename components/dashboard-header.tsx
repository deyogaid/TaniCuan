'use client'

import Link from 'next/link'
import { Bell, Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface DashboardHeaderProps {
  onRefresh: () => void
  isRefreshing?: boolean
}

export function DashboardHeader({ onRefresh, isRefreshing }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center gap-2 text-primary font-bold">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <span className="text-lg font-bold">T</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Cari komoditas..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-destructive rounded-full" />
            <span className="sr-only">Notifikasi</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary hidden sm:flex"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="sr-only">Keranjang</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

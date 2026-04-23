'use client'

import { RefreshCw, Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  onRefresh: () => void
  isRefreshing?: boolean
}

export function DashboardHeader({ onRefresh, isRefreshing }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">T</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">TaniCuan</h1>
            <p className="text-xs opacity-80">Harga Pasar Real-Time</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <RefreshCw className={cn('w-5 h-5', isRefreshing && 'animate-spin')} />
            <span className="sr-only">Refresh data</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Bell className="w-5 h-5" />
            <span className="sr-only">Notifikasi</span>
          </Button>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="px-4 pb-3">
        <LastUpdated />
      </div>
    </header>
  )
}

function LastUpdated() {
  const now = new Date()
  const timeString = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const dateString = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="text-xs opacity-80">
      <span>Update terakhir: {timeString}</span>
      <span className="mx-2">|</span>
      <span>{dateString}</span>
    </div>
  )
}

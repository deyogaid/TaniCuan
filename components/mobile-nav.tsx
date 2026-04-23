'use client'

import { cn } from '@/lib/utils'
import { Home, BarChart3, Bell, User } from 'lucide-react'

interface MobileNavProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const navItems = [
  { id: 'home', label: 'Beranda', icon: Home },
  { id: 'analysis', label: 'Analisis', icon: BarChart3 },
  { id: 'alerts', label: 'Notifikasi', icon: Bell },
  { id: 'profile', label: 'Profil', icon: User },
]

export function MobileNav({ activeTab = 'home', onTabChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                'min-w-[64px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'fill-primary/20')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Market } from '@/lib/types'
import { MapPin, ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface MarketSelectorProps {
  markets: Market[]
  selectedMarket: Market | null
  onSelectMarket: (market: Market) => void
}

export function MarketSelector({
  markets,
  selectedMarket,
  onSelectMarket,
}: MarketSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-card"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="truncate">
              {selectedMarket?.name || 'Pilih Pasar'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
        {markets.map((market) => (
          <DropdownMenuItem
            key={market.id}
            onClick={() => {
              onSelectMarket(market)
              setOpen(false)
            }}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="font-medium">{market.name}</span>
              <span className="text-xs text-muted-foreground">
                {market.location}, {market.province}
              </span>
            </div>
            {selectedMarket?.id === market.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Horizontal scrollable market pills for mobile
export function MarketPills({
  markets,
  selectedMarket,
  onSelectMarket,
}: MarketSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {markets.map((market) => (
        <button
          key={market.id}
          onClick={() => onSelectMarket(market)}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            'border whitespace-nowrap',
            selectedMarket?.id === market.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-foreground border-border hover:border-primary/50'
          )}
        >
          {market.name.replace('Pasar Induk ', '')}
        </button>
      ))}
    </div>
  )
}

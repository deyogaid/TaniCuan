'use client'

import { cn } from '@/lib/utils'
import type { TrafficSignal } from '@/lib/types'
import { getSignalColors } from '@/lib/signal-utils'

interface TrafficLightSignalProps {
  signal: TrafficSignal
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showRecommendation?: boolean
  className?: string
}

export function TrafficLightSignal({
  signal,
  size = 'md',
  showLabel = true,
  showRecommendation = false,
  className,
}: TrafficLightSignalProps) {
  const colors = getSignalColors(signal.signal)
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Signal light */}
      <div
        className={cn(
          'rounded-full flex-shrink-0',
          sizeClasses[size],
          colors.bg,
          colors.glow,
          'animate-pulse'
        )}
        aria-label={`Sinyal ${signal.label}`}
      />
      
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn('font-semibold', textSizes[size], colors.text.replace('text-white', 'text-foreground'))}>
            {signal.label}
          </span>
          {showRecommendation && (
            <span className="text-xs text-muted-foreground leading-tight">
              {signal.recommendation}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for use in cards/lists
export function SignalBadge({ signal }: { signal: TrafficSignal }) {
  const colors = getSignalColors(signal.signal)
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold',
        colors.bg,
        colors.text
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {signal.label}
    </span>
  )
}

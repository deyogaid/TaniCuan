'use client'

import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

const categories: Category[] = [
  { id: 'bumbu', name: 'Bumbu', icon: '🧅', color: 'bg-purple-100' },
  { id: 'sayur', name: 'Sayuran', icon: '🥬', color: 'bg-green-100' },
  { id: 'umbi', name: 'Umbi', icon: '🥔', color: 'bg-amber-100' },
  { id: 'buah', name: 'Buah', icon: '🍊', color: 'bg-orange-100' },
  { id: 'beras', name: 'Beras', icon: '🌾', color: 'bg-yellow-100' },
  { id: 'daging', name: 'Daging', icon: '🥩', color: 'bg-red-100' },
  { id: 'ikan', name: 'Ikan', icon: '🐟', color: 'bg-blue-100' },
  { id: 'lainnya', name: 'Lainnya', icon: '📦', color: 'bg-slate-100' },
]

export function CategoryMenu() {
  return (
    <div className="bg-card py-4 mb-2 shadow-sm rounded-xl">
      <div className="flex overflow-x-auto scrollbar-hide px-4 gap-4 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="flex flex-col items-center gap-2 min-w-[64px] active:scale-95 transition-transform"
          >
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl', cat.color)}>
              {cat.icon}
            </div>
            <span className="text-xs font-medium text-center">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  ChevronDown, 
  ChevronRight,
  Leaf, 
  Carrot, 
  Apple, 
  Banana,
  Wheat,
  Coffee,
  Egg,
  Mushroom,
  Cherry,
  Grape,
  Citrus,
  Flower2,
  Salad
} from 'lucide-react'

// Icon mapping for commodities
const iconMap: Record<string, React.ElementType> = {
  'pepper': Leaf,
  'onion': Leaf,
  'garlic': Leaf,
  'turmeric': Leaf,
  'ginger': Leaf,
  'galangal': Leaf,
  'nut': Leaf,
  'tomato': Cherry,
  'carrot': Carrot,
  'cabbage': Salad,
  'bean': Leaf,
  'spinach': Leaf,
  'potato': Leaf,
  'sweet-potato': Leaf,
  'cassava': Leaf,
  'orange': Citrus,
  'banana': Banana,
  'mango': Apple,
  'apple': Apple,
  'grape': Grape,
}

// Category labels in Indonesian
const categoryLabels: Record<string, string> = {
  'bumbu': 'Bumbu & Rempah',
  'sayur': 'Sayur-mayur',
  'umbi': 'Umbi & Akar',
  'buah': 'Buah-buahan',
}

interface MenuItem {
  id: string
  name: string
  icon?: string
}

interface CategoryGroup {
  category: string
  items: MenuItem[]
}

interface InteractiveMenuProps {
  categories: CategoryGroup[]
  selectedItem?: string
  onItemSelect?: (itemId: string) => void
}

export function InteractiveMenu({ 
  categories, 
  selectedItem, 
  onItemSelect 
}: InteractiveMenuProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.category))
  )

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  return (
    <nav className="w-full space-y-1">
      {categories.map(group => {
        const isExpanded = expandedCategories.has(group.category)
        const IconComponent = iconMap[group.items[0]?.icon] || Pepper
        
        return (
          <div key={group.category} className="mb-2">
            <button
              onClick={() => toggleCategory(group.category)}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-lg',
                'text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'text-foreground'
              )}
            >
              <span className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                {categoryLabels[group.category] || group.category}
              </span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            {isExpanded && (
              <div className="ml-4 mt-1 space-y-0.5">
                {group.items.map(item => {
                  const ItemIcon = iconMap[item.icon] || Pepper
                  const isSelected = selectedItem === item.id
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onItemSelect?.(item.id)}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-sm',
                        'transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <ItemIcon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

// Demo component with sample data
export function DemoInteractiveMenu() {
  const sampleCategories: CategoryGroup[] = [
    {
      category: 'bumbu',
      items: [
        { id: 'cabai-merah', name: 'Cabai Merah Keriting', icon: 'pepper' },
        { id: 'cabai-rawit', name: 'Cabai Rawit Merah', icon: 'pepper' },
        { id: 'bawang-merah', name: 'Bawang Merah', icon: 'onion' },
        { id: 'bawang-putih', name: 'Bawang Putih', icon: 'garlic' },
        { id: 'kunyit', name: 'Kunyit', icon: 'turmeric' },
        { id: 'jahe', name: 'Jahe', icon: 'ginger' },
      ]
    },
    {
      category: 'sayur',
      items: [
        { id: 'tomat', name: 'Tomat', icon: 'tomato' },
        { id: 'wortel', name: 'Wortel', icon: 'carrot' },
        { id: 'kubis', name: 'Kubis', icon: 'cabbage' },
        { id: 'buncis', name: 'Buncis', icon: 'bean' },
        { id: 'bayam', name: 'Bayam', icon: 'spinach' },
        { id: 'kangkung', name: 'Kangkung', icon: 'spinach' },
      ]
    },
    {
      category: 'umbi',
      items: [
        { id: 'kentang', name: 'Kentang', icon: 'potato' },
        { id: 'ubi-jalar', name: 'Ubi Jalar', icon: 'sweet-potato' },
        { id: 'singkong', name: 'Singkong', icon: 'cassava' },
      ]
    },
    {
      category: 'buah',
      items: [
        { id: 'jeruk-manis', name: 'Jeruk Manis', icon: 'orange' },
        { id: 'pisang-ambon', name: 'Pisang Ambon', icon: 'banana' },
        { id: 'mangga-gedong', name: 'Mangga Gedong', icon: 'mango' },
        { id: 'apel', name: 'Apel', icon: 'apple' },
        { id: 'anggur', name: 'Anggur', icon: 'grape' },
      ]
    },
  ]

  const [selected, setSelected] = useState<string>('cabai-merah')

  return (
    <div className="p-4 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Pilih Komoditas</h3>
      <InteractiveMenu 
        categories={sampleCategories}
        selectedItem={selected}
        onItemSelect={setSelected}
      />
    </div>
  )
}
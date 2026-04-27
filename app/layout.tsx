import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { InteractiveMenu } from '@/components/interactive-menu'
import { MobileDropdownMenu } from '@/components/mobile-dropdown-menu'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TaniCuan - Harga Pasar Real-Time untuk Petani',
  description: 'Platform pemantau harga pasar induk real-time dengan sinyal lampu lalu lintas dan prediksi AI untuk membantu petani mendapat harga terbaik',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

// Sample categories for the menu
const menuCategories = [
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="bg-background">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar Menu */}
          <aside className="hidden lg:block w-64 border-r bg-card p-4 sticky top-0 h-screen overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-lg font-bold">Kategori</h2>
              <p className="text-sm text-muted-foreground">Pilih komoditas</p>
            </div>
            <InteractiveMenu categories={menuCategories} />
          </aside>

          <div className="flex-1">
            {/* Mobile Dropdown Menu */}
            <header className="lg:hidden sticky top-0 z-40 border-b border-border bg-card px-4 py-3 shadow-sm shadow-slate-950/5 backdrop-blur-sm">
              <MobileDropdownMenu />
            </header>

            {/* Main Content */}
            <main className="flex-1 min-h-screen px-4 py-4 pb-24 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

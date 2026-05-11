'use client'

import { useEffect, useState } from 'react'

const banners = [
  { id: 1, title: 'Harga Cabai Naik!', desc: 'Cek prediksi harga minggu ini.', color: 'from-orange-500 to-red-500' },
  { id: 2, title: 'Fitur AI Baru', desc: 'Analisis pasar dengan bantuan AI secara gratis.', color: 'from-blue-500 to-purple-500' },
  { id: 3, title: 'Pasar Terdekat', desc: 'Temukan harga terbaik di sekitar Anda.', color: 'from-green-500 to-emerald-500' },
]

export function PromoBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="px-4 py-3 bg-background">
      <div className="relative w-full h-32 overflow-hidden rounded-xl shadow-sm">
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 w-full h-full p-6 text-white bg-gradient-to-r ${banner.color} transition-transform duration-500 ease-in-out`}
            style={{ transform: `translateX(${(idx - currentIndex) * 100}%)` }}
          >
            <h2 className="text-xl font-bold mb-1">{banner.title}</h2>
            <p className="text-sm opacity-90">{banner.desc}</p>
          </div>
        ))}
        {/* Pagination Dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {banners.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

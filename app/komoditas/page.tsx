import { DemoInteractiveMenu } from '@/components/interactive-menu'

export default function KomoditasPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Pilih Komoditas</h1>
        <p className="text-muted-foreground mb-6">
          Telusuri komoditas berdasarkan kategori
        </p>
        
        <DemoInteractiveMenu />
      </div>
    </div>
  )
}
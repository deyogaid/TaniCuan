import { getAIStudioUrl, getAIStudioLabel } from '@/lib/ai-studio'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const aiStudioUrl = getAIStudioUrl()

export default function AIStudioDashboardPage() {
  if (!aiStudioUrl) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-xl mx-auto rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-3">AI Studio Dashboard</h1>
          <p className="text-sm text-muted-foreground mb-4">
            URL AI Studio belum dikonfigurasi. Pastikan environment variables berikut tersedia:
          </p>
          <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
{`NEXT_PUBLIC_AI_STUDIO_DEV_URL
NEXT_PUBLIC_AI_STUDIO_SHARED_URL`}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Integrasi AI Studio</p>
            <h1 className="text-2xl font-bold">Dashboard AI Studio</h1>
            <p className="text-sm text-muted-foreground">{getAIStudioLabel()}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={aiStudioUrl} target="_blank" rel="noreferrer noopener">
              Buka di tab baru
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <iframe
            src={aiStudioUrl}
            title="AI Studio Dashboard"
            className="w-full min-h-[calc(100vh-120px)] border-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}

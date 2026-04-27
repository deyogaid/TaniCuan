# TaniCuan - Platform Prediksi Harga Komoditas Pertanian

Platform web untuk monitoring dan prediksi harga komoditas pertanian Indonesia dengan integrasi AI Studio untuk akurasi prediksi yang lebih tinggi.

## Fitur Utama

- **Monitoring Harga Real-time**: Pantau harga komoditas di berbagai pasar Indonesia
- **Prediksi Harga**: Prediksi harga 7 hari ke depan dengan algoritma AI
- **Sinyal Trading**: Rekomendasi jual/beli/tunggu berdasarkan analisis teknikal
- **Dashboard Interaktif**: Visualisasi data harga dengan candlestick chart

## Integrasi AI Studio

Platform ini terintegrasi dengan AI Studio untuk meningkatkan akurasi prediksi harga:

### Environment Variables

Tambahkan konfigurasi berikut ke `.env.local`:

```env
# AI Studio Integration
AI_STUDIO_DEV_URL=https://ais-dev-76nmmkjruw6sgqkbpb2xsy-756359165063.asia-east1.run.app
AI_STUDIO_SHARED_URL=https://ais-pre-76nmmkjruw6sgqkbpb2xsy-756359165063.asia-east1.run.app
```

### Cara Kerja

1. **Prediksi Utama**: Sistem akan mencoba menggunakan AI Studio API untuk mendapatkan prediksi
2. **Fallback**: Jika AI Studio tidak tersedia, sistem akan menggunakan algoritma lokal (regresi linear)
3. **Caching**: Prediksi disimpan di database Supabase untuk performa yang lebih baik

### API Endpoint

```
GET /api/predictions/[commodityId]?days=7
```

Response:
```json
{
  "commodity_id": "uuid",
  "signal": {
    "color": "GREEN|YELLOW|RED",
    "label_text": "Jual Sekarang",
    "action_text": "Harga sedang bagus...",
    "confidence_pct": 85,
    "model_raw": {...}
  },
  "price_mode": 15000,
  "predictions": [
    {
      "date": "2024-01-15",
      "predicted_price": 15200,
      "price_low": 14500,
      "price_high": 16000,
      "confidence_level": 80
    }
  ],
  "cached": false
}
```

## Teknologi

- **Frontend**: Next.js 16, React, TypeScript
- **UI**: Radix UI, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: AI Studio API

## Setup Development

1. Clone repository
2. Install dependencies: `pnpm install`
3. Setup environment variables di `.env.local`
4. Setup database: `psql -f scripts/*.sql`
5. Run development: `pnpm dev`

## Deployment

- **Development**: Menggunakan `AI_STUDIO_DEV_URL`
- **Production**: Menggunakan `AI_STUDIO_SHARED_URL`

Sistem akan otomatis memilih URL berdasarkan `NODE_ENV`.
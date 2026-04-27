import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const { message, commodityData, commodityName } = await request.json()

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            )
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        // Build context from commodity data
        const context = commodityData
            ? `
Konteks Data Komoditas:
- Nama Komoditas: ${commodityName || 'N/A'}
- Harga Saat Ini: Rp${commodityData.latestPrice?.toLocaleString('id-ID') || 'N/A'}
- Harga Sebelumnya: Rp${commodityData.previousPrice?.toLocaleString('id-ID') || 'N/A'}
- Perubahan Harga: ${commodityData.priceChange?.toFixed(2) || 'N/A'}% 
- Sinyal: ${commodityData.signal?.label || 'N/A'} (${commodityData.signal?.signal?.toUpperCase() || 'N/A'})
- Volatilitas: ${commodityData.signal?.volatility?.toFixed(2) || 'N/A'}
- Rekomendasi: ${commodityData.signal?.recommendation || 'N/A'}
`
            : ''

        const systemPrompt = `Anda adalah asisten AI ahli dalam analisis pasar pertanian Indonesia. 
Anda membantu petani menganalisis harga komoditas, memprediksi tren, dan memberikan rekomendasi tindakan.
Gunakan bahasa Indonesia yang mudah dipahami oleh petani dengan literasi digital rendah.
Berikan analisis berdasarkan data harga OHLC (Open, High, Low, Close), volatilitas, dan sinyal lampu lalu lintas.
Selalu berikan rekomendasi praktis yang dapat langsung diambil petani.
${context}`

        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7,
            },
            systemInstruction: systemPrompt,
        })

        const result = await chat.sendMessage(message)
        const response = result.response
        const text = response.text()

        return NextResponse.json({
            message: text,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Gemini API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

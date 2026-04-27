'use client'

import { useState, useRef, useEffect } from 'react'
import type { CommodityPriceData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Send, MessageCircle, X } from 'lucide-react'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface AIPredictionChatProps {
    commodityData?: CommodityPriceData
    isOpen?: boolean
    onClose?: () => void
}

export function AIPredictionChat({
    commodityData,
    isOpen = true,
    onClose,
}: AIPredictionChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content:
                'Halo! Saya adalah asisten AI untuk analisis prediksi harga komoditas. Anda bisa bertanya tentang tren harga, kapan waktu terbaik untuk panen atau menjual, dan rekomendasi berdasarkan data pasar saat ini.',
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/predictions/gemini-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    commodityData: commodityData
                        ? {
                            latestPrice: commodityData.latestPrice,
                            previousPrice: commodityData.previousPrice,
                            priceChange: commodityData.priceChange,
                            signal: commodityData.signal,
                        }
                        : null,
                    commodityName: commodityData?.commodity.name,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to get response')
            }

            const data = await response.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('Error:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content:
                    'Maaf, terjadi kesalahan saat memproses permintaan. Silakan coba lagi.',
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
            inputRef.current?.focus()
        }
    }

    if (!isOpen) {
        return null
    }

    return (
        <Card className="flex flex-col h-[600px] max-h-[600px] bg-background border rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-sm md:text-base">
                        Analisis Prediksi AI
                    </h3>
                    {commodityData && (
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                            {commodityData.commodity.name}
                        </span>
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map(message => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            <div
                                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg text-sm ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-muted text-foreground rounded-bl-none'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap break-words">
                                    {message.content}
                                </p>
                                <span className="text-xs opacity-70 mt-1 block">
                                    {message.timestamp.toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">
                                    Sedang menganalisis...
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Commodity Info (Optional) */}
            {commodityData && (
                <div className="border-t bg-muted/30 p-3 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <span className="text-muted-foreground">Harga Saat Ini:</span>
                            <p className="font-semibold text-sm">
                                Rp{commodityData.latestPrice?.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Perubahan:</span>
                            <p
                                className={`font-semibold text-sm ${commodityData.priceChange > 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                            >
                                {commodityData.priceChange > 0 ? '+' : ''}
                                {commodityData.priceChange.toFixed(2)}%
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Sinyal:</span>
                            <p
                                className={`font-semibold text-sm capitalize ${commodityData.signal.signal === 'green'
                                        ? 'text-green-600'
                                        : commodityData.signal.signal === 'yellow'
                                            ? 'text-yellow-600'
                                            : 'text-red-600'
                                    }`}
                            >
                                {commodityData.signal.label}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t p-3 bg-background">
                <div className="flex gap-2">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                            }
                        }}
                        placeholder="Tanya tentang prediksi harga..."
                        disabled={isLoading}
                        className="text-sm"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        size="sm"
                        className="px-3"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    )
}

import type { OHLCData, TrafficSignal, SignalType } from './types'

/**
 * Calculate traffic light signal based on price momentum and volatility
 * 
 * Signal Logic:
 * - GREEN (Tahan/Hold): Price is rising, under-supply expected - hold for better price
 * - RED (Jual/Sell): Price is falling, over-supply - sell before price drops more
 * - YELLOW (Tunggu/Wait): Uncertain, high volatility - wait for clearer signal
 */
export function calculateTrafficSignal(ohlcData: OHLCData[]): TrafficSignal {
  if (ohlcData.length < 3) {
    return {
      signal: 'yellow',
      label: 'Tunggu',
      recommendation: 'Data belum cukup untuk analisis',
      priceChange: 0,
      volatility: 0,
    }
  }

  // Get recent data (last 7 days)
  const recentData = ohlcData.slice(-7)
  const latestPrice = recentData[recentData.length - 1].close
  const weekAgoPrice = recentData[0].close
  
  // Calculate price change percentage
  const priceChange = ((latestPrice - weekAgoPrice) / weekAgoPrice) * 100
  
  // Calculate volatility (standard deviation of daily changes)
  const dailyChanges = recentData.slice(1).map((d, i) => {
    const prevClose = recentData[i].close
    return ((d.close - prevClose) / prevClose) * 100
  })
  
  const avgChange = dailyChanges.reduce((a, b) => a + b, 0) / dailyChanges.length
  const variance = dailyChanges.reduce((sum, val) => sum + Math.pow(val - avgChange, 2), 0) / dailyChanges.length
  const volatility = Math.sqrt(variance)

  // Determine signal
  let signal: SignalType
  let label: string
  let recommendation: string

  // High volatility = wait
  if (volatility > 5) {
    signal = 'yellow'
    label = 'Tunggu'
    recommendation = 'Pasar tidak stabil, tunggu harga lebih pasti'
  }
  // Strong uptrend = hold/buy
  else if (priceChange > 3) {
    signal = 'green'
    label = 'Tahan'
    recommendation = 'Harga naik, tahan untuk harga lebih baik'
  }
  // Strong downtrend = sell
  else if (priceChange < -3) {
    signal = 'red'
    label = 'Jual'
    recommendation = 'Harga turun, jual sebelum turun lagi'
  }
  // Slight uptrend = hold
  else if (priceChange > 0) {
    signal = 'green'
    label = 'Tahan'
    recommendation = 'Harga cenderung naik, bisa ditahan'
  }
  // Slight downtrend = sell
  else if (priceChange < 0) {
    signal = 'red'
    label = 'Jual'
    recommendation = 'Harga cenderung turun, pertimbangkan jual'
  }
  // Flat = wait
  else {
    signal = 'yellow'
    label = 'Tunggu'
    recommendation = 'Harga stabil, tunggu pergerakan pasar'
  }

  return {
    signal,
    label,
    recommendation,
    priceChange,
    volatility,
  }
}

/**
 * Get signal color classes for styling
 */
export function getSignalColors(signal: SignalType): {
  bg: string
  text: string
  border: string
  glow: string
} {
  switch (signal) {
    case 'green':
      return {
        bg: 'bg-[oklch(0.6_0.18_145)]',
        text: 'text-white',
        border: 'border-[oklch(0.5_0.15_145)]',
        glow: 'shadow-[0_0_20px_oklch(0.6_0.18_145/0.5)]',
      }
    case 'red':
      return {
        bg: 'bg-[oklch(0.55_0.22_25)]',
        text: 'text-white',
        border: 'border-[oklch(0.45_0.18_25)]',
        glow: 'shadow-[0_0_20px_oklch(0.55_0.22_25/0.5)]',
      }
    case 'yellow':
    default:
      return {
        bg: 'bg-[oklch(0.75_0.15_85)]',
        text: 'text-[oklch(0.25_0.05_85)]',
        border: 'border-[oklch(0.65_0.12_85)]',
        glow: 'shadow-[0_0_20px_oklch(0.75_0.15_85/0.5)]',
      }
  }
}

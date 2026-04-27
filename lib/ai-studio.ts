export const AI_STUDIO_DEV_URL = process.env.NEXT_PUBLIC_AI_STUDIO_DEV_URL ?? ''
export const AI_STUDIO_SHARED_URL = process.env.NEXT_PUBLIC_AI_STUDIO_SHARED_URL ?? ''

export function getAIStudioUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return AI_STUDIO_SHARED_URL || AI_STUDIO_DEV_URL
  }
  return AI_STUDIO_DEV_URL || AI_STUDIO_SHARED_URL
}

export function getAIStudioLabel(): string {
  return process.env.NODE_ENV === 'production' ? 'Shared AI Studio Dashboard' : 'Development AI Studio Dashboard'
}

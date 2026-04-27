'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useFastPageLoad(routes: string[]) {
    const router = useRouter()

    useEffect(() => {
        const prefetchRoutes = () => {
            routes.forEach(route => {
                if (typeof route === 'string' && route.length > 0) {
                    router.prefetch(route)
                }
            })
        }

        let idleCallback: number | undefined
        const globalWindow = typeof window !== 'undefined' ? (window as unknown as Window & typeof globalThis) : undefined

        if (globalWindow) {
            if ('requestIdleCallback' in globalWindow) {
                idleCallback = globalWindow.requestIdleCallback(prefetchRoutes, {
                    timeout: 1000,
                })
            } else {
                idleCallback = globalWindow.setTimeout(prefetchRoutes, 600)
            }
        }

        return () => {
            if (globalWindow && idleCallback !== undefined) {
                if ('cancelIdleCallback' in globalWindow) {
                    globalWindow.cancelIdleCallback(idleCallback)
                } else {
                    globalWindow.clearTimeout(idleCallback)
                }
            }
        }
    }, [router, routes])
}

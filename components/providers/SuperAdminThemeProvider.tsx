'use client'

import { ReactNode, useEffect } from 'react'
import posthog from 'posthog-js'
import { isPostHogConfigured } from '@/lib/posthog'

interface SuperAdminThemeProviderProps {
  children: ReactNode
  user: {
    id: string
    email?: string
    role: string
  }
}

export function SuperAdminThemeProvider({ children, user }: SuperAdminThemeProviderProps) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'motion-grid')
    if (isPostHogConfigured) {
      posthog.identify(user.id, {
        ...(user.email ? { email: user.email } : {}),
        role: user.role,
      })
    }

    return () => {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [user])

  return <>{children}</>
}

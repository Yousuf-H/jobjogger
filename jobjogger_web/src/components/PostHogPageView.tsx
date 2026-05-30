import { posthog } from '@/lib/posthog'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function PostHogPageView() {
  const location = useLocation()

  useEffect(() => {
    posthog.capture('$pageview', { $current_url: window.location.href })
  }, [location.pathname])

  return null
}

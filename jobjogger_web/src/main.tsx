import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthProvider.tsx'
import './index.css'
import { ThemeProvider } from 'next-themes'
import { initPostHog } from './lib/posthog.ts'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 0,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
})

initPostHog()

// Sync the user's server-stored theme into next-themes' localStorage key before
// ThemeProvider initialises so the correct theme is applied on first render.
// This makes theme roam across devices: sign in on any device and get your theme.
try {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser) as { theme?: string }
    if (parsedUser?.theme) {
      localStorage.setItem('theme', parsedUser.theme)
    }
  }
} catch {
  // ignore parse errors — next-themes will fall back to system
}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
       <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)

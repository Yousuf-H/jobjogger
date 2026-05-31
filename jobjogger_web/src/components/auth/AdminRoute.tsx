import { PageLoading } from '@/components/layout/PageLoading'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, refreshUser } = useAuth()
  const [refreshed, setRefreshed] = useState(false)

  useEffect(() => {
    // If there's a user in state but admin is falsy, the cached value may be
    // stale (promoted after sign-in, or pre-dates the admin field). Fetch once
    // to get the current server value before deciding to redirect.
    if (user && !user.admin) {
      refreshUser().finally(() => setRefreshed(true))
    } else {
      setRefreshed(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || !refreshed) return <PageLoading />

  if (!user) return <Navigate to="/signin" replace />

  if (!user.admin) return <Navigate to="/" replace />

  return <>{children}</>
}

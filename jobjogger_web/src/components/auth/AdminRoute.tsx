import { PageLoading } from '@/components/layout/PageLoading'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, refreshUser } = useAuth()

  // If the user is already confirmed admin (or absent), no refresh is needed.
  // Otherwise we need to fetch /users/me once before deciding to redirect,
  // in case the cached value is stale (promoted after sign-in, or pre-dates the field).
  const [refreshed, setRefreshed] = useState(() => !user || !!user.admin)

  useEffect(() => {
    if (!refreshed) {
      refreshUser().finally(() => setRefreshed(true))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || !refreshed) return <PageLoading />

  if (!user) return <Navigate to="/signin" replace />

  if (!user.admin) return <Navigate to="/" replace />

  return <>{children}</>
}

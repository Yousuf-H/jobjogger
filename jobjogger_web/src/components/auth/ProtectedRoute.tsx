import { PageLoading } from '@/components/layout/PageLoading'
import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'

/**
 * Route guard that requires an authenticated user.
 *
 * Renders a full-page loader while the initial auth check is in progress
 * (`isLoading: true`). Redirects to `/signin` when no user is present.
 * Renders `children` once a valid session is confirmed.
 *
 * Used to wrap every private route in `App.tsx`.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <PageLoading />

  if (!user) return <Navigate to="/signin" replace />

  return <>{children}</>
}

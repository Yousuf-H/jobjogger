import { PageLoading } from '@/components/layout/PageLoading'
import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <PageLoading />

  if (!user) return <Navigate to="/signin" replace />

  return <>{children}</>
}

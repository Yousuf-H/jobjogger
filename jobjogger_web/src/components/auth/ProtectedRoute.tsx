import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/signin" replace />
  }

  return <>{children}</>
}

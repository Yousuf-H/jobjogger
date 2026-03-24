import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'

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

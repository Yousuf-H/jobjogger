import { PageLoading } from '@/components/layout/PageLoading'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/services/api/client'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function OAuthCallbackPage() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const token = searchParams.get('token')

  useEffect(() => {
    const establish = token
      ? apiClient.post('/auth/session', { token }).then((r) => r.data.user)
      : apiClient.get('/users/me').then((r) => r.data.user)

    establish
      .then((user) => {
        if (user) {
          updateUser(user)
          navigate(redirectTo, { replace: true })
        } else {
          navigate('/signin?oauth_error=true', { replace: true })
        }
      })
      .catch(() => {
        navigate('/signin?oauth_error=true', { replace: true })
      })
  }, [])

  return <PageLoading />
}

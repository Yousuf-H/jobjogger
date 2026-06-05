import { PageLoading } from '@/components/layout/PageLoading'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/services/api/client'
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function OAuthCallbackPage() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const jti = searchParams.get('jti')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const establish = jti
      ? apiClient.post('/auth/session', { jti }).then((r) => r.data.user)
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

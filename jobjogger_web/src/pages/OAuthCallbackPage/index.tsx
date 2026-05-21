import { PageLoading } from '@/components/layout/PageLoading'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/services/api/client'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OAuthCallbackPage() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    apiClient
      .get('/users/me')
      .then((response) => {
        const user = response.data.user
        if (user) {
          updateUser(user)
          navigate('/', { replace: true })
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

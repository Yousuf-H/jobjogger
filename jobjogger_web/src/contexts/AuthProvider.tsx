import { AuthContext } from '@/contexts/AuthContext'
import { posthog } from '@/lib/posthog'
import { apiClient } from '@/services/api/client'
import { acceptTermsApi, demoSigninApi, fetchMe } from '@/services/api/user'
import { type User } from '@/types/user'
import { type ReactNode, useState } from 'react'

function identifyUser(user: User) {
  posthog.identify(String(user.id), { email: user.email, name: user.name, demo: user.demo, admin: user.admin })
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return null
    const parsed = JSON.parse(storedUser) as User
    identifyUser(parsed)
    return parsed
  })

  const [isLoading, setIsLoading] = useState(false)

  const signin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/users/sign_in', {
        user: { email, password },
      })

      const data = response.data

      if (data.status.user) {
        setUser(data.status.user)
        localStorage.setItem('user', JSON.stringify(data.status.user))
        identifyUser(data.status.user)
      } else {
        throw new Error('Invalid email or password.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, agreedToTerms: boolean) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/users', {
        user: {
          email,
          password,
          password_confirmation: password,
          name,
          agreed_to_terms: agreedToTerms,
        },
      })

      const data = response.data

      if (data.user) {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        identifyUser(data.user)
      } else {
        throw new Error('Signup failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signout = async () => {
    setIsLoading(true)
    if (user) {
      try {
        await apiClient.delete('/users/sign_out')
      } catch (error) {
        console.error('Signout request failed:', error)
      }
    }
    setUser(null)
    localStorage.removeItem('user')
    posthog.reset()
    setIsLoading(false)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    identifyUser(updatedUser)
  }

  const refreshUser = async () => {
    try {
      const fresh = await fetchMe()
      setUser(fresh)
      localStorage.setItem('user', JSON.stringify(fresh))
      identifyUser(fresh)
    } catch {
      // ignore — if the request fails the existing state stands
    }
  }

  const acceptTerms = async () => {
    const data = await acceptTermsApi()
    if (data.user) {
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      identifyUser(data.user)
    }
  }

  const demoSignin = async () => {
    setIsLoading(true)
    try {
      const response = await demoSigninApi()
      const data = response.data

      if (data.status.user) {
        setUser(data.status.user)
        localStorage.setItem('user', JSON.stringify(data.status.user))
        identifyUser(data.status.user)
      }
    } catch (err: unknown) {
      throw new Error((err as Error).message || 'Demo signin failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signin,
        signup,
        signout,
        updateUser,
        refreshUser,
        demoSignin,
        acceptTerms,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

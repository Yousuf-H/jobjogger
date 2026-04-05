import { AuthContext } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'
import { acceptTermsApi, demoSigninApi } from '@/services/api/user'
import { type User } from '@/types/user'
import { type ReactNode, useState } from 'react'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
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
    setIsLoading(false)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const acceptTerms = async () => {
    const data = await acceptTermsApi()
    if (data.user) {
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
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
        demoSignin,
        acceptTerms,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

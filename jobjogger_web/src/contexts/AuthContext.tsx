import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth'
import type { User } from './auth'
import { apiClient } from '@/services/api/client'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token')
  })

  const [isLoading, setIsLoading] = useState(false)

  const signin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/users/sign_in', {
        user: { email, password },
      })

      const authToken = response.headers['authorization']?.replace(
        'Bearer ',
        ''
      )
      const data = response.data

      if (authToken && data.status.user) {
        setToken(authToken)
        setUser(data.status.user)
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('user', JSON.stringify(data.status.user))
      }
    } catch (err: unknown) {
      throw new Error((err as Error).message || 'Signin failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/users', {
        user: {
          email,
          password,
          password_confirmation: password,
          name,
        },
      })

      const authToken = response.headers['authorization']?.replace(
        'Bearer ',
        ''
      )
      const data = response.data

      if (authToken && data.data) {
        setToken(authToken)
        setUser(data.data)
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('user', JSON.stringify(data.data))
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { status?: { message?: string } } } })
          .response?.data?.status?.message || 'Signup failed'
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const signout = async () => {
    setIsLoading(true)
    try {
      if (token) {
        try {
          await apiClient.delete('/users/sign_out')
        } catch (error) {
          console.error('Signout request failed:', error)
        }
      }

      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, token, signin, signup, signout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

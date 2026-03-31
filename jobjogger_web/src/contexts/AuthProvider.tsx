import { AuthContext } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'
import type { User } from '@/types/user'
import { type ReactNode, useState } from 'react'

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
      } else {
        throw new Error('Invalid email or password.')
      }
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

      if (authToken && data.user) {
        setToken(authToken)
        setUser(data.user)
        localStorage.setItem('auth_token', authToken)
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

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{ user, token, signin, signup, signout, updateUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

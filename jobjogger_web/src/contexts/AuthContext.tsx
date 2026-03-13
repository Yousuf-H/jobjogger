import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth'
import type { User } from './auth'

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
      const response = await fetch(
        'http://localhost:3000/api/v1/users/sign_in',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: { email, password } }),
        }
      )

      if (!response.ok) {
        throw new Error('Signin failed')
      }

      const authToken = response.headers
        .get('Authorization')
        ?.replace('Bearer ', '')
      const data = await response.json()

      if (authToken && data.status.user) {
        setToken(authToken)
        setUser(data.status.user)
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('user', JSON.stringify(data.status.user))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            email,
            password,
            password_confirmation: password,
            name,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.status?.message || 'Signup failed')
      }

      const authToken = response.headers
        .get('Authorization')
        ?.replace('Bearer ', '')
      const data = await response.json()

      if (authToken && data.data) {
        setToken(authToken)
        setUser(data.data)
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('user', JSON.stringify(data.data))
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
          await fetch('http://localhost:3000/api/v1/users/sign_out', {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
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

import { createContext } from 'react'

export interface User {
  id: number
  email: string
  name: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  signin: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

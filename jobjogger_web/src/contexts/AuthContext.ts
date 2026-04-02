import { type User } from '@/types/user'
import { createContext } from 'react'

export interface AuthContextType {
  user: User | null
  token: string | null
  signin: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  signout: () => Promise<void>
  updateUser: (user: User) => void
  demoSignin: () => Promise<void>
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

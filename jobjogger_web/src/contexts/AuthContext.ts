import { type User } from '@/types/user'
import { createContext } from 'react'

export interface AuthContextType {
  user: User | null
  signin: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, agreedToTerms: boolean) => Promise<void>
  signout: () => Promise<void>
  updateUser: (user: User) => void
  demoSignin: () => Promise<void>
  acceptTerms: () => Promise<void>
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

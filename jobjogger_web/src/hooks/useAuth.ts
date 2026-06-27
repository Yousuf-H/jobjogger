import { AuthContext } from '@/contexts/AuthContext'
import { useContext } from 'react'

/**
 * Returns the current authentication context.
 *
 * Provides access to the authenticated user object, auth action functions
 * (`signin`, `signup`, `signout`, `demoSignin`, `acceptTerms`), and the
 * `isLoading` flag that is `true` while the initial session check runs.
 *
 * Must be called inside a component that is a descendant of `AuthProvider`.
 * Throws an error if called outside the provider — this is intentional, as it
 * indicates a mis-placed component in the tree.
 *
 * @returns The `AuthContextType` value from the nearest `AuthProvider`.
 * @throws If called outside an `AuthProvider`.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { AuthContext } from '@/contexts/AuthContext'
import { createWrapper } from '../utils'
import { testUser } from '../fixtures'
import type { ReactNode } from 'react'

describe('useAuth', () => {
  it('returns the context value when inside a provider', () => {
    const wrapper = createWrapper({ auth: { user: testUser } })
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toEqual(testUser)
    expect(result.current.isLoading).toBe(false)
  })

  it('returns null user when auth context has no user', () => {
    const wrapper = createWrapper({ auth: { user: null } })
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
  })

  it('throws when used outside an AuthProvider', () => {
    // Render without any AuthContext.Provider — context value will be undefined
    const noProviderWrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider value={undefined as never}>{children}</AuthContext.Provider>
    )
    expect(() => {
      renderHook(() => useAuth(), { wrapper: noProviderWrapper })
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})

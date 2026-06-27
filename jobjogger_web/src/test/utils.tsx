import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext, type AuthContextType } from '@/contexts/AuthContext'
import { testUser } from './fixtures'
import type { ReactNode } from 'react'

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

const defaultAuthContext: AuthContextType = {
  user: testUser,
  signin: () => Promise.resolve(),
  signup: () => Promise.resolve(),
  signout: () => Promise.resolve(),
  updateUser: () => undefined,
  refreshUser: () => Promise.resolve(),
  demoSignin: () => Promise.resolve(),
  acceptTerms: () => Promise.resolve(),
  isLoading: false,
}

interface WrapperOptions {
  auth?: Partial<AuthContextType>
  initialEntries?: string[]
  queryClient?: QueryClient
}

export function createWrapper({ auth, initialEntries = ['/'], queryClient }: WrapperOptions = {}) {
  const qc = queryClient ?? createTestQueryClient()
  const authValue = { ...defaultAuthContext, ...auth }

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={initialEntries}>
            {children}
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    )
  }
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  const { auth, initialEntries, queryClient, ...renderOptions } = options
  return render(ui, {
    wrapper: createWrapper({ auth, initialEntries, queryClient }),
    ...renderOptions,
  })
}

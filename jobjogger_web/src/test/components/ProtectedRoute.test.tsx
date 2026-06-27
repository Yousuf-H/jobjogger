import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { renderWithProviders } from '../utils'

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects to /signin when user is null', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Should not render</div>
      </ProtectedRoute>,
      { auth: { user: null }, initialEntries: ['/dashboard'] },
    )
    expect(screen.queryByText('Should not render')).not.toBeInTheDocument()
  })

  it('shows a loading state while auth is resolving', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
      { auth: { user: null, isLoading: true } },
    )
    // PageLoading renders — children are not shown
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })
})

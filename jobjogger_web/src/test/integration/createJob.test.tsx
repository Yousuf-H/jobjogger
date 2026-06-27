import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateJobDialog from '@/components/job/CreateJobDialog'
import { renderWithProviders } from '../utils'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Add Job flow (integration)', () => {
  it('opens the dialog, fills in the form, and submits successfully', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateJobDialog />)

    // Open the dialog
    await user.click(screen.getByRole('button', { name: /new job/i }))

    // Dialog should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Add job' })).toBeInTheDocument()

    // Fill in required fields
    await user.type(screen.getByPlaceholderText(/acme corp/i), 'ACME Corp')
    await user.type(screen.getByPlaceholderText(/store manager/i), 'Software Engineer')

    // Submit the form (the submit button also reads "Add job" — target by type)
    const submitButton = screen.getByRole('button', { name: 'Add job' })
    await user.click(submitButton)

    // After successful creation, dialog closes
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateJobDialog />)

    await user.click(screen.getByRole('button', { name: /new job/i }))

    // Submit without filling required fields
    await user.click(screen.getByRole('button', { name: 'Add job' }))

    // Validation errors should appear
    await waitFor(() => {
      expect(screen.getByText(/company name is required/i)).toBeInTheDocument()
    })
  })

  it('dialog can be closed without submitting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateJobDialog />)

    await user.click(screen.getByRole('button', { name: /new job/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Press Escape to close
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

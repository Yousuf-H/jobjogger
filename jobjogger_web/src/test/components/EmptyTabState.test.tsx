import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Briefcase } from 'lucide-react'
import EmptyTabState from '@/components/job/EmptyTabState'

describe('EmptyTabState', () => {
  it('renders the title and description', () => {
    render(
      <EmptyTabState
        icon={Briefcase}
        title="Nothing here yet"
        description="Add something to get started."
      />,
    )
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
    expect(screen.getByText('Add something to get started.')).toBeInTheDocument()
  })

  it('does not render an action button when actionLabel is omitted', () => {
    render(
      <EmptyTabState
        icon={Briefcase}
        title="Empty"
        description="No data."
      />,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not render an action button when onAction is omitted', () => {
    render(
      <EmptyTabState
        icon={Briefcase}
        title="Empty"
        description="No data."
        actionLabel="Add item"
      />,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders an action button when both actionLabel and onAction are provided', () => {
    const onAction = vi.fn()
    render(
      <EmptyTabState
        icon={Briefcase}
        title="Empty"
        description="No data."
        actionLabel="Add item"
        onAction={onAction}
      />,
    )
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument()
  })

  it('calls onAction when the button is clicked', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <EmptyTabState
        icon={Briefcase}
        title="Empty"
        description="No data."
        actionLabel="Add item"
        onAction={onAction}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Add item' }))
    expect(onAction).toHaveBeenCalledOnce()
  })
})

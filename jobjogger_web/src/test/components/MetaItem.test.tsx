import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Briefcase } from 'lucide-react'
import { MetaItem } from '@/components/ui/MetaItem'

describe('MetaItem', () => {
  it('renders the label', () => {
    render(
      <MetaItem icon={Briefcase} label="Company">
        <span>ACME</span>
      </MetaItem>,
    )
    expect(screen.getByText('Company')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <MetaItem icon={Briefcase} label="Company">
        <span>ACME Corp</span>
      </MetaItem>,
    )
    expect(screen.getByText('ACME Corp')).toBeInTheDocument()
  })

  it('renders without crashing when children is a string', () => {
    render(
      <MetaItem icon={Briefcase} label="Status">
        Applied
      </MetaItem>,
    )
    expect(screen.getByText('Applied')).toBeInTheDocument()
  })
})

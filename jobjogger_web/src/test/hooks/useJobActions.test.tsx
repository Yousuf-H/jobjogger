import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useJobActions } from '@/hooks/useJobActions'
import { createWrapper } from '../utils'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useJobActions', () => {
  it('returns the expected shape', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useJobActions(), { wrapper })

    expect(typeof result.current.handleView).toBe('function')
    expect(result.current.archiveMutation).toBeDefined()
    expect(result.current.unarchiveMutation).toBeDefined()
    expect(result.current.deleteMutation).toBeDefined()
  })

  it('deleteMutation succeeds and calls onDeleteSuccess', async () => {
    const onDeleteSuccess = vi.fn()
    const wrapper = createWrapper()
    const { result } = renderHook(
      () => useJobActions({ onDeleteSuccess }),
      { wrapper },
    )

    act(() => {
      result.current.deleteMutation.mutate(1)
    })

    await waitFor(() => expect(result.current.deleteMutation.isSuccess).toBe(true))
    expect(onDeleteSuccess).toHaveBeenCalledOnce()
  })

  it('archiveMutation succeeds', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useJobActions(), { wrapper })

    act(() => {
      result.current.archiveMutation.mutate(1)
    })

    await waitFor(() => expect(result.current.archiveMutation.isSuccess).toBe(true))
  })

  it('unarchiveMutation succeeds', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useJobActions(), { wrapper })

    act(() => {
      result.current.unarchiveMutation.mutate(1)
    })

    await waitFor(() => expect(result.current.unarchiveMutation.isSuccess).toBe(true))
  })
})

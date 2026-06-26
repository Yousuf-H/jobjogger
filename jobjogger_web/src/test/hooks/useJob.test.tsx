import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useJob } from '@/hooks/useJob'
import { createWrapper } from '../utils'
import { testJob } from '../fixtures'

describe('useJob', () => {
  it('fetches a job by id', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useJob(String(testJob.id)), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.job.id).toBe(testJob.id)
    expect(result.current.data?.job.company_name).toBe(testJob.company_name)
  })

  it('starts in loading state', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useJob(String(testJob.id)), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('does not fetch when id is undefined', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useJob(undefined), { wrapper })
    // enabled: false means no pending fetch — stays idle
    expect(result.current.isPending).toBe(true)
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('returns an error for a non-existent job (404)', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useJob('404'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

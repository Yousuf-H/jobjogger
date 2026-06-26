import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useJobs } from '@/hooks/useJobs'
import { createWrapper } from '../utils'
import { testJobList } from '../fixtures'

describe('useJobs', () => {
  it('fetches the jobs list', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useJobs(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(testJobList.length)
    expect(result.current.data?.[0].company_name).toBe(testJobList[0].company_name)
  })

  it('starts in loading state', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useJobs(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('accepts filters without error', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useJobs({ status: 'applied' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // MSW returns the full list regardless of filter — just verify no error
    expect(result.current.isError).toBe(false)
  })
})

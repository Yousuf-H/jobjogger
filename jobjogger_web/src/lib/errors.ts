import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'

export function extractErrorMessage(error: unknown, fallback: string): string {
  const e = error as AxiosError<ApiErrorResponse>
  return (
    e.response?.data?.status?.message ??
    e.response?.data?.errors?.[0] ??
    e.response?.data?.error ??
    fallback
  )
}

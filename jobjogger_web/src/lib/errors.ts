import type { AxiosError } from 'axios'

type ApiErrorData = {
  status?: { message?: string }
  errors?: string[]
  error?: string
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  const e = error as AxiosError<ApiErrorData>
  return (
    e.response?.data?.status?.message ??
    e.response?.data?.errors?.[0] ??
    e.response?.data?.error ??
    fallback
  )
}

import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'

/**
 * Extracts a human-readable error message from an Axios error response.
 *
 * Checks three response shapes in priority order:
 *   1. `response.data.status.message` — standard Rails API error format
 *   2. `response.data.errors[0]`      — ActiveRecord validation errors array
 *   3. `response.data.error`          — simple error string field
 *
 * Falls back to `fallback` for non-Axios errors, null/undefined, or responses
 * that don't match any of the known shapes.
 *
 * @param error    - The caught error value (typically from a TanStack mutation's `onError`).
 * @param fallback - Human-readable string to return when no structured message is found.
 * @returns The extracted message, or `fallback`.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback
  const e = error as AxiosError<ApiErrorResponse>
  return (
    e.response?.data?.status?.message ??
    e.response?.data?.errors?.[0] ??
    e.response?.data?.error ??
    fallback
  )
}

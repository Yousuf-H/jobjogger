import {
  fetchContact,
  fetchContacts,
  fetchJobContacts,
} from '@/services/api/contacts'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Fetches a filtered list of all contacts for the current user.
 *
 * Uses `keepPreviousData` to prevent list flash while filters change.
 * Pass `options.enabled = false` to defer the fetch (e.g. in lazy dialogs).
 *
 * @param params          - Optional filter params: `search` string and/or `organisation_id`.
 * @param options.enabled - Set to `false` to skip fetching until ready (default: `true`).
 * @returns A TanStack `UseQueryResult` with an array of `Contact` objects.
 */
export function useContacts(
  params?: { search?: string; organisation_id?: number },
  options?: { enabled?: boolean }
) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.contacts.list(userId, params),
    queryFn: () => fetchContacts(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Fetches a single contact by ID.
 *
 * Disabled when `id` is undefined — safe to call before the route param resolves.
 *
 * @param id - Contact ID as a string (from `useParams`), or `undefined`.
 * @returns A TanStack `UseQueryResult` with the `Contact` object.
 */
export function useContact(id: string | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.contacts.detail(userId, id),
    queryFn: () => fetchContact(Number(id)),
    enabled: !!id,
  })
}

/**
 * Fetches the contacts linked to a specific job via the `contact_jobs` join table.
 *
 * Disabled when `jobId` is undefined.
 *
 * @param jobId - The job whose contacts to fetch, or `undefined`.
 * @returns A TanStack `UseQueryResult` with an array of `Contact` objects.
 */
export function useJobContacts(jobId: number | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.contacts.forJob(userId, jobId),
    queryFn: () => fetchJobContacts(Number(jobId)),
    enabled: !!jobId,
  })
}
